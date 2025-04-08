import * as oauth from 'oauth-sign';
import axios from 'axios';
import * as qrs from 'querystring';
import prisma from '@backend/services/prismaClient';
import crypto from 'crypto';
import { PreferenceExchange, User } from '@prisma/client';
import { findMatchingPreferences } from '@backend/services/getExchanges';

const consumerKey = process.env.CONSUMER_KEY!;
const consumerSecret = process.env.CONSUMER_SECRET!;
const usosApiBaseUrl = process.env.USOS_API_BASE_URL!;
const appBaseUrl = process.env.APP_BASE_URL!;

export async function makeAuthorizedUsosApiCall(
  user: User,
  route: string,
  params: Record<string, string> = {}
): Promise<any> {
  const oauthParams = generateOAuthParams({
    oauth_token: user.accessToken,
    ...params,
  });

  oauthParams.oauth_signature = oauth.hmacsign(
    'POST',
    `${usosApiBaseUrl}${route}`,
    oauthParams,
    consumerSecret,
    user.accessTokenSecret
  );

  try {
    const response = await axios.post(`${usosApiBaseUrl}${route}`, null, {
      params: oauthParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user courses and groups:', error);
    throw error;
  }
}

export async function makeAnonymousUsosApiCall(
  route: string,
  params: Record<string, string> = {}
): Promise<any> {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'PLAINTEXT',
    oauth_signature: `${consumerSecret}&`,
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_version: '1.0',
    ...params,
  };

  try {
    const response = await axios.post(`${usosApiBaseUrl}${route}`, null, {
      params: oauthParams,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(`Error in anonymous API call to ${route}:`, error);
    throw error;
  }
}

export function generateOAuthParams(
  additionalParams: Record<string, string> = {}
) {
  return {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_signature: null,
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_version: '1.0',
    ...additionalParams,
  };
}

async function getRequestToken(callbackUrl: string): Promise<{
  oauthToken: string;
  oauthTokenSecret: string;
}> {
  const oauthParams = generateOAuthParams({
    oauth_callback: callbackUrl,
    scopes: 'studies|photo|email|offline_access',
  });

  const url = `${usosApiBaseUrl}services/oauth/request_token`;
  oauthParams.oauth_signature = oauth.hmacsign(
    'POST',
    url,
    oauthParams,
    consumerSecret
  );

  try {
    const response = await axios.post(url, null, { params: oauthParams });
    const { oauth_token: oauthToken, oauth_token_secret: oauthTokenSecret } =
      qrs.parse(response.data);

    return {
      oauthToken: oauthToken as string,
      oauthTokenSecret: oauthTokenSecret as string,
    };
  } catch (error) {
    console.error('Error obtaining request token:', error);
    throw error;
  }
}

export async function getAccessToken(
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string
): Promise<{
  accessToken: string;
  accessTokenSecret: string;
}> {
  const oauthParams = generateOAuthParams({
    oauth_token: oauthToken,
    oauth_verifier: oauthVerifier,
  });

  oauthParams.oauth_signature = oauth.hmacsign(
    'POST',
    `${usosApiBaseUrl}services/oauth/access_token`,
    oauthParams,
    consumerSecret,
    oauthTokenSecret
  );

  try {
    const response = await axios.post(
      `${usosApiBaseUrl}services/oauth/access_token`,
      null,
      {
        params: oauthParams,
      }
    );

    const { oauth_token: accessToken, oauth_token_secret: accessTokenSecret } =
      qrs.parse(response.data);

    return {
      accessToken: accessToken as string,
      accessTokenSecret: accessTokenSecret as string,
    };
  } catch (error) {
    console.error('Error obtaining access token:', error);
    throw error;
  }
}

export async function getUserInfo(
  accessToken: string,
  accessSecret: string
): Promise<any> {
  const oauthParams = generateOAuthParams({ oauth_token: accessToken });

  oauthParams.oauth_signature = oauth.hmacsign(
    'GET',
    `${usosApiBaseUrl}services/users/user`,
    oauthParams,
    consumerSecret,
    accessSecret
  );

  try {
    const response = await axios.get(`${usosApiBaseUrl}services/users/user`, {
      params: oauthParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user courses and groups:', error);
    throw error;
  }
}

export async function getAuthorizeUrl(callbackRoute: string): Promise<{
  authorizeUrl: string;
}> {
  const callbackUrl = `${appBaseUrl}${callbackRoute}`;
  const { oauthToken, oauthTokenSecret } = await getRequestToken(callbackUrl);
  await prisma.oauthTemporal.create({
    data: {
      oauthToken,
      oauthTokenSecret,
    },
  });

  return {
    authorizeUrl: `${usosApiBaseUrl}services/oauth/authorize?oauth_token=${oauthToken}&interactivity=confirm_user`,
  };
}

export async function authenticateUser(
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string
): Promise<User> {
  const { accessToken, accessTokenSecret } = await getAccessToken(
    oauthToken,
    oauthTokenSecret,
    oauthVerifier
  );

  const userInfo = (await getUserInfo(accessToken, accessTokenSecret)) as {
    id: string;
    first_name: string;
    last_name: string;
  };

  const user = await prisma.user.upsert({
    where: {
      id: userInfo.id,
    },
    update: {
      accessToken,
      accessTokenSecret,
    },
    create: {
      id: userInfo.id,
      accessToken,
      accessTokenSecret,
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
    },
  });

  return user;
}

export async function getOauthTokenSecret(oauthToken: string): Promise<string> {
  const oauthTemporal = await prisma.oauthTemporal.findUnique({
    where: { oauthToken: oauthToken },
  });

  if (!oauthTemporal) {
    return null;
  }

  const { oauthTokenSecret } = oauthTemporal;

  return oauthTokenSecret;
}

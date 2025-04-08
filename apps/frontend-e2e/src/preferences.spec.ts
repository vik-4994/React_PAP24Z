import { findMatchingPreferences } from '@backend/services/getExchanges';
import { trpc } from '@frontend/utils/trpc';
import { test, expect } from '@playwright/test';
import { makeAnonymousUsosApiCall } from '@backend/services/usos/oauth';
import { scrapeTimetable } from '@backend/services/usos/scrapeTimetable';
test('preferences', async () => {
  const mockApiResponse = [];

  const userId = '1192872';
  const result = await findMatchingPreferences(userId);
  expect(result).toEqual(mockApiResponse);
});

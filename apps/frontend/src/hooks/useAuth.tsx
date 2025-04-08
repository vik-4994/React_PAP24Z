import { trpc } from '@frontend/utils/trpc';
import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo;
  isLoading: boolean;
  isError: boolean;
}

interface UserInfo {
  firstName?: string;
  lastName?: string;
  id?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: authResp, isLoading, isError } = trpc.auth.check.useQuery();

  const { data: userInfoResp } = trpc.auth.user.useQuery(undefined, {
    enabled: authResp?.isAuthenticated ?? false,
  });

  const isAuthenticated = authResp?.isAuthenticated ?? false;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userInfo: {
          firstName: userInfoResp?.first_name,
          lastName: userInfoResp?.last_name,
          id: userInfoResp?.id,
        },
        isLoading,
        isError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { UserProfile, LoginCredentials } from '@/types/auth';
import { AuthService } from '@/services/auth.service';
import { AUTH_MESSAGES } from '@/constants/auth';
import { showToast } from '@/components/ShowToast';
import { AxiosError } from 'axios';
import { ToastVariants } from '@/enums/global.enum';
import { useSession } from '@/hooks/useSession';
import { defaultMessages } from '@/constants/chatInterface';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile>({});
  const [loading, setLoading] = useState<boolean>(true);
  const { setMessages } = useSession();

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const userData = await AuthService.login(credentials);
      setUser(userData);
      showToast({
        message: AUTH_MESSAGES.SUCCESS.LOGIN,
        variant: ToastVariants.SUCCESS,
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ errorCode?: string }>;
      const errorMessage = axiosError.response?.data?.errorCode
        ? AUTH_MESSAGES.ERROR[
            axiosError.response.data
              .errorCode as keyof typeof AUTH_MESSAGES.ERROR
          ]
        : AUTH_MESSAGES.ERROR.UNKNOWN_ERROR;

      showToast({ message: errorMessage, variant: ToastVariants.ERROR });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
      setUser({});
      setMessages([...defaultMessages]);
      showToast({
        message: AUTH_MESSAGES.SUCCESS.LOGOUT,
        variant: ToastVariants.SUCCESS,
      });
    } catch {
      showToast({
        message: AUTH_MESSAGES.ERROR.UNKNOWN_ERROR,
        variant: ToastVariants.ERROR,
      });
    }
  }, []);

  const contextValue = useMemo(
    () => ({ user, login, logout, loading }),
    [user, loading, login, logout],
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
      } catch {
        showToast({
          message: AUTH_MESSAGES.ERROR.SESSION_EXPIRED,
          variant: ToastVariants.ERROR,
        });
        setUser({});
      } finally {
        setLoading(false);
      }
    };

    const hasSession = document.cookie.includes('session=true');
    if (!hasSession) {
      setLoading(false);
      return;
    } else {
      fetchUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

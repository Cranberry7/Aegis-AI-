import { axiosBackendInstance } from '@/utils/axiosInstance';
import { LoginCredentials, UserProfile } from '@/types/auth';
import { API_ROUTES } from '@/constants/routes';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<UserProfile> {
    const { data } = await axiosBackendInstance.post(
      API_ROUTES.LOGIN,
      credentials,
      {
        withCredentials: true,
      },
    );
    return data.data;
  }

  static async logout(): Promise<void> {
    await axiosBackendInstance.post(
      API_ROUTES.LOGOUT,
      {},
      { withCredentials: true },
    );
  }

  static async getCurrentUser(): Promise<UserProfile> {
    const { data } = await axiosBackendInstance.get(API_ROUTES.AUTH, {
      withCredentials: true,
    });
    return data.data;
  }
}

import { InviteUserStatus } from './auth.enum';

export interface IInviteUserResponse {
  email: string;
  status: InviteUserStatus;
  message: string;
}

export interface IGetUserRecord {
  id: string;
  isEmailVerified?: boolean;
  name?: string;
  email: string;
  account: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    value: string;
    code: string;
  };
}

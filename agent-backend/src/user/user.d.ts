export interface IUserData {
  numberOfRows: number;
  rows: {
    id: string;
    name: string;
    email: string;
    password: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    role: {
      code: string;
    };
  }[];
}

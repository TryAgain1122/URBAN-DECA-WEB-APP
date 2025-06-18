export interface IUser {
  id?: number | string; // usually an ID field, can be number or UUID string
  name: string;
  email: string;
  password?: string; // Optional since you usually don't expose password after login
  avatar?: {
    public_id?: string;
    url?: string;
  };
  role: string;
  googleId?: string;
  createdAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
}

export interface LocalLogin {
  id: string;
  username: string;
  salt: string;
  hashedPassword: string;
  provider: string;
  providerId: string;
}

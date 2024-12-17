export interface RefreshToken {
  iss: string;
  aud: string;
  expiresIn: string;
  iat: number;
  sub: string;
  username: string;
}

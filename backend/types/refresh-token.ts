// fixme: is this dupe of the type in shared?
export interface RefreshToken {
  iss: string;
  aud: string;
  iat: number;
  expiresIn: string;
  sub: string;
  username: string;
}

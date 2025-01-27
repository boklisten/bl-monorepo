export interface RefreshToken {
  iss: string; // what server issued the token
  aud: string; // where the token is valid
  iat: number; // at what time the token was issued at
  exp: number; // at what time the token expires
  sub: string; // the user id for the token
  username: string; // the username
}

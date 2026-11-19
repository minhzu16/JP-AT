export type JwtSecretName = 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET';

/**
 * Reads a required token-signing secret. There is no built-in default: the API refuses to start
 * when a secret is missing, shorter than 32 characters, or when both secrets are the same
 * (a refresh token would then also be a valid access token).
 */
export function requireSecret(name: JwtSecretName): string {
  const value = process.env[name];
  if (!value || value.length < 32) {
    throw new Error(`${name} must be set to at least 32 characters (see .env.example)`);
  }
  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
  }
  return value;
}

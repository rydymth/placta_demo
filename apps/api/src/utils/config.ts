import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile();

const env = (name: string, fallback?: string): string => {
  const value = process.env[name];
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error("Missing required env var: " + name);
};

const int = (name: string, fallback: number): number => {
  const n = Number.parseInt(env(name, String(fallback)), 10);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Env var ${name} must be a positive integer`);
  return n;
};

const adminOrigin = env("ADMIN_ORIGIN", "http://localhost:4200");

const config = {
  nodeEnv: env("NODE_ENV", "development"),
  isProd: env("NODE_ENV", "development") === "production",
  port: int("PORT", 6969),
  mongodbUri: env("MONGODB_URI"),
  adminOrigin,
  trustProxy: env("TRUST_PROXY", "false") === "true",
  rpId: env("WEBAUTHN_RP_ID", new URL(adminOrigin).hostname),
  rpName: env("WEBAUTHN_RP_NAME", "Placta CMS"),
  accessTokenTtlSeconds: int("ACCESS_TOKEN_TTL_SECONDS", 900),
  refreshTokenTtlDays: int("REFRESH_TOKEN_TTL_DAYS", 14),
  // Getter so scripts that never touch auth (seed, smoke) don't need the secret.
  get jwtAccessSecret(): string {
    const secret = env("JWT_ACCESS_SECRET");
    if (secret.length < 32) throw new Error("JWT_ACCESS_SECRET must be at least 32 characters");
    return secret;
  },
};

export default config;

import { SignJWT, jwtVerify } from "jose";
import config from "../utils/config.ts";

const ISSUER = "placta";
const AUDIENCE = "placta-admin";

const key = () => new TextEncoder().encode(config.jwtAccessSecret);

export const signAccessToken = (userId: string): Promise<string> =>
  new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + config.accessTokenTtlSeconds)
    .sign(key());

// Resolves to the user id. Throws on anything invalid or expired.
export async function verifyAccessToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, key(), {
    algorithms: ["HS256"],
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  if (!payload.sub) throw new Error("Token has no subject");
  return payload.sub;
}

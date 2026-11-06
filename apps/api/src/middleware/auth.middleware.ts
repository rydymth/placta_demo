import type { RequestHandler, Response } from "express";
import type { UserDto } from "@placta/contracts";
import { verifyAccessToken } from "../services/token.service.ts";
import { toUserDto } from "../services/auth.service.ts";
import { findUserById } from "../repositories/auth.repository.ts";
import { forbidden, unauthorized } from "../utils/errors.ts";

export const getAuth = (res: Response): UserDto => res.locals["auth"] as UserDto;

// Role always comes from the database, never from the token.
export const authenticate: RequestHandler = async (req, res, next) => {
  const token = /^Bearer (.+)$/.exec(req.headers.authorization ?? "")?.[1];
  if (!token) throw unauthorized();
  const userId = await verifyAccessToken(token).catch(() => {
    throw unauthorized("Invalid or expired token");
  });
  const user = await findUserById(userId);
  if (!user) throw unauthorized("Invalid or expired token");
  res.locals["auth"] = toUserDto(user);
  next();
};

export const requireRole =
  (...roles: UserDto["role"][]): RequestHandler =>
  (_req, res, next) => {
    if (!roles.includes(getAuth(res).role)) throw forbidden();
    next();
  };

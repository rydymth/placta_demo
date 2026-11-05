import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile();

function required<T>(name: string): T {
  const value = process.env[name];
  if (!value) throw new Error("Missing required env var: " + name);
  return value as T;
}

const config = {
  port: required<Number>("PORT") || 6969,
  mongodbUri: required<string>("MONGODB_URI")
}

export default config

import express, { Application } from "express"
import helmet from "helmet";
import { requestLogger } from "./middleware/logging.middleware.ts"
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.ts";
import config from "./utils/config.ts"
import healthRoutes from "./routes/health.routes.ts"
import v1Routes from "./routes/v1.routes.ts";
import { connectDb, disconnectDb } from "./database/connection.ts";
import { initModels } from "./database/indexes.ts";

const app: Application = express();
const PORT = config.port;

app.disable("x-powered-by");
if (config.trustProxy) app.set("trust proxy", 1); // needed for real client IPs behind nginx

// First middlewares
app.use(helmet());
app.use(express.json({ limit: "1mb" }))
app.use(requestLogger)

// API mapping
app.use('/api', healthRoutes)
app.use('/api/v1', v1Routes)

// Must stay last
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  config.jwtAccessSecret; // fail fast when the secret is missing or too short
  await connectDb();
  await initModels(); // builds the unique indexes before any request is served

  const server = app.listen(PORT, () => {
    console.info(`Server has started at PORT: ${PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectDb();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

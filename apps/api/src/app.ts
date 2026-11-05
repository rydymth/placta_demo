import express, { Application } from "express"
import { requestLogger } from "./middleware/logging.middleware.ts"
import config from "./utils/config.ts"
import healthRoutes from "./routes/health.routes.ts"
import { connectDb, disconnectDb } from "./database/connection.ts";
import { PageModel } from "./models/page.model.ts";

const app: Application = express();
const PORT = config.port; // is a dict`

// First middlewares
app.use(express.json())
app.use(requestLogger)

// API mapping
app.use('/api', healthRoutes)

async function start() {
  await connectDb();
  await PageModel.init(); // builds the unique slug index before any request is served

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

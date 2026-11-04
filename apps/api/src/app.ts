import express, { Application } from "express"
import { requestLogger } from "./middleware/logging.middleware.ts"
import envImporter from "./utils/envImporter.ts"
import healthRoutes from "./routes/health.routes.ts"

const app: Application = express();
const PORT = envImporter.ports;

// First middlewares
app.use(express.json())
app.use(requestLogger)

// API mapping
app.use('/api', healthRoutes)

//

app.listen(PORT, () => {
    console.info(`Server has started at PORT: ${PORT}`);
});

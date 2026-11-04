import express, { Application } from "express"
import { requestLogger } from "./middleware/logging.middleware"
import healthRoutes from "./routes/health.routes"

const app: Application = express();
const PORT = 3000;

// First middlewares
app.use(express.json())
app.use(requestLogger)

// API mapping
app.use('/api', healthRoutes)

app.listen(PORT, () => {
    console.info("Server has started at PORT: 3000")
});

import express from "express";
import cors from "cors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import fieldRouter from "./routes/fieldRoutes";
import fillRouter from "./routes/fillRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const swaggerDocument = YAML.load(
  path.resolve(__dirname, "./docs/swagger.yaml")
);

const app = express();

const devOrigins = [ "http://localhost:5173", "http://127.0.0.1:5173" ];
const prodOrigin = "https://node-react-brasao-v37a.vercel.app";

const allowedOrigins = process.env.NODE_ENV === "production"
  ? [prodOrigin]
  : devOrigins;

app.use(cors({
  origin: allowedOrigins,
}));


app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/campos", fieldRouter);
app.use("/preenchimentos", fillRouter);
app.use(errorMiddleware);

export default app;

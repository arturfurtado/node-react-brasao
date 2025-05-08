import express from "express";
import cors from "cors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import fieldRouter from "./routes/fieldRoutes";
import fillRouter from "./routes/fillRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleware";

const swaggerDocument = YAML.load(
  path.resolve(__dirname, "./docs/swagger.yaml")
);

const app = express();

app.use(cors({
  origin: "https://node-react-brasao-v37a.vercel.app",
  methods: ["GET","POST","PUT","DELETE"],
}));

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/campos", fieldRouter);
app.use("/preenchimentos", fillRouter);
app.use(errorMiddleware);

export default app;

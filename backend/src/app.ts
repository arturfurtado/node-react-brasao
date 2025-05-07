import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import fieldRouter from "./routes/fieldRoutes";
import fillRouter from "./routes/fillRoutes";

interface HttpError extends Error {
  statusCode?: number;
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/campos", fieldRouter);
app.use("/preenchimentos", fillRouter);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Ocorreu um erro interno no servidor.";

  res.status(statusCode).json({ message });

});

export default app;

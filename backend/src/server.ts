import { AppDataSource } from "./config/data-source";
import app from "./app";

const PORT = process.env.PORT ?? 4000;

AppDataSource.initialize()
  .then(() => {
    console.log("✔️ Data source initialized");
    app.listen(PORT, () => {
      console.log(`Servidor rodando na em: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro:", err);
  });

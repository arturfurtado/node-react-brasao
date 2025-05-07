import "reflect-metadata";
import { DataSource } from "typeorm";
import { Field } from "../entities/fields";
import { Fill } from "../entities/fills";
import * as dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Field, Fill],
  migrations: ["src/migration/*.ts"],
  synchronize: false,    
});

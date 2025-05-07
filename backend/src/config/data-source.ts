import "reflect-metadata";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Field } from "../entities/fields";
import { Fill } from "../entities/fills";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const AppDataSource = new DataSource({
  type: "postgres",
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Field, Fill],
  migrations: ["src/migration/*.ts"],
  synchronize: false,
});

console.log({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

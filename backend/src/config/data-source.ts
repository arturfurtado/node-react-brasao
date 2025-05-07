import "reflect-metadata";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Field } from "../entities/fields";
import { Fill } from "../entities/fills";
import path from "path";

const envPath = process.env.NODE_ENV === "test"
  ? path.resolve(__dirname, "../../.env.test")
  : path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

export const AppDataSource = new DataSource(
  process.env.NODE_ENV === "test"
    ? {
        type: "sqlite",
        database: ":memory:",
        dropSchema: true,
        entities: [Field, Fill],
        synchronize: true,
      }
    : {
        type: "postgres",
        host:     process.env.DB_HOST,
        port:     Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [Field, Fill],
        migrations: ["src/migration/*.ts"],
        synchronize: false,
      }
);

import "reflect-metadata";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Field } from "../entities/fields";
import { Fill } from "../entities/fills";
import path from "path";

const envPath =
  process.env.NODE_ENV === "test"
    ? path.resolve(__dirname, "../../.env.test")
    : path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const isTest = process.env.NODE_ENV === "test";
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const migrationsPathJs = path.join(__dirname, "..", "migration", "*.js");
const migrationsPathTs = path.join(__dirname, "..", "migration", "*.ts");

export const AppDataSource = new DataSource(
  isTest
    ? {
        type: "sqlite",
        database: ":memory:",
        dropSchema: true,
        entities: [Field, Fill],
        synchronize: true,
      }
    : hasDatabaseUrl
    ? {
        type: "postgres",
        url: process.env.DATABASE_URL,
        entities: [Field, Fill],
        migrations: [path.join(__dirname, "..", "migration", "*.js")], 
        synchronize: false,
      }
    : {
        type: "postgres",
        host: process.env.DB_HOST ?? "localhost",
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [Field, Fill],
        migrations: [path.join(__dirname, "..", "migration", "*.js")], 
        synchronize: false,
      }
);

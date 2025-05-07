import { AppDataSource } from "../config/data-source";
import { Field, DataType } from "../entities/fields";
import { Repository } from "typeorm";

const repo = (): Repository<Field> => AppDataSource.getRepository(Field);

export async function createField(name: string, datatype: DataType) {
  const exists = await repo().findOneBy({ name });
  if (exists) {
    const err = new Error("Já existe um campo com esse nome.");
    (err as any).statusCode = 400;
    throw err;
  }

  const field = repo().create({ name, datatype });
  const saved = await repo().save(field);

  (saved as any).fills = [];
  return saved;
}

export async function listFields() {
  return repo().find({
    relations: ["fills"],
    order: { createdAt: "ASC" },
  });
}

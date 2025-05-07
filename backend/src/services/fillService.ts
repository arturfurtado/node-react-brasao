import { AppDataSource } from "../config/data-source";
import { Fill } from "../entities/fills";
import { Field } from "../entities/fields";
import { Repository } from "typeorm";

const fillRepo = (): Repository<Fill> => AppDataSource.getRepository(Fill);
const fieldRepo = (): Repository<Field> => AppDataSource.getRepository(Field);

export async function createFill(fieldId: string, value: string) {
  const field = await fieldRepo().findOne({ where: { id: fieldId } });
  if (!field) {
    const err = new Error("Campo não encontrado.");
    (err as any).statusCode = 404;
    throw err;
  }

  switch (field.datatype) {
    case "number":
      if (isNaN(Number(value))) {
        throw Object.assign(new Error("Valor deve ser numérico."), { statusCode: 400 });
      }
      break;
    case "boolean":
      if (value !== "true" && value !== "false") {
        throw Object.assign(new Error("Valor deve ser booleano ('true' ou 'false')."), { statusCode: 400 });
      }
      break;
    case "date":
      if (isNaN(new Date(value).getTime())) {
        throw Object.assign(new Error("Formato de data inválido."), { statusCode: 400 });
      }
      break;
  }

  const fill = fillRepo().create({ fieldId, value });
  return fillRepo().save(fill);
}

export async function listFills() {
  return fillRepo().find({ relations: ["field"], order: { createdAt: "ASC" } });
}

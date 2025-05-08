import { ValidationException } from "../exceptions/validateException";
import { AppDataSource } from "../config/data-source";
import { Field, DataType } from "../entities/fields";
import { Repository } from "typeorm";
import { fieldRepository } from "../repositories/field-repository";

const repo = (): Repository<Field> => AppDataSource.getRepository(Field);

export async function createField(name: string, datatype: DataType) {
  const exists = await fieldRepository.findByName(name);
  if (exists) {
    throw new ValidationException("Esse nome ja existe");
  }

  const field = await fieldRepository.create(name, datatype);
  field.fills = [];
  return field;
}

export async function listFields() {
  return fieldRepository.findAllWithFills();
}

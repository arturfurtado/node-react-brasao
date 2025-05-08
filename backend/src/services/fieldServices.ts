import { ValidationException } from "../exceptions/validateException";
import { Field, DataType } from "../entities/fields";
import { fieldRepository } from "../repositories/field-repository";
import { fillRepository } from "../repositories/fill-repository";

export async function createField(name: string, datatype: DataType): Promise<Field> {
  const exists = await fieldRepository.findByName(name);
  if (exists) {
    throw new ValidationException("Esse nome já existe");
  }
  const field = await fieldRepository.create(name, datatype);
  field.fills = [];
  return field;
}

export async function listFields(): Promise<Field[]> {
  return fieldRepository.findAllWithFills();
}

export async function updateField(
  id: string,
  name: string,
  datatype: DataType
): Promise<Field> {
  const field = await fieldRepository.findById(id);
  if (!field) {
    throw new ValidationException("Campo não encontrado");
  }

  if (name !== field.name) {
    const exists = await fieldRepository.findByName(name);
    if (exists) {
      throw new ValidationException("Esse nome já existe");
    }
  }

  const fills = (await fillRepository.findByFieldId(id)) ?? [];
  if (fills.length > 0 && datatype !== field.datatype) {
    throw new ValidationException(
      "Não é possível alterar o tipo de um campo que já possui preenchimentos. Apague-os ou crie um novo campo."
    );
  }

  return fieldRepository.update(id, { name, datatype });
}

export async function deleteField(id: string): Promise<void> {
  const field = await fieldRepository.findById(id);
  if (!field) {
    throw new ValidationException("Campo não encontrado");
  }
  await fieldRepository.delete(id);
}

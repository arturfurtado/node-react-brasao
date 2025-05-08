import { ValidationException } from "../exceptions/validateException";
import { fillRepository } from "../repositories/fill-repository";
import { fieldRepository } from "../repositories/field-repository"; 

export async function createFill(fieldId: string, value: string) {
  const field = await fieldRepository.findById(fieldId);
  if (!field) {
    throw new ValidationException("Campo nao encontrado");
  }

  switch (field.datatype) {
    case "number":
      if (isNaN(Number(value))) {
        throw new ValidationException("Valor deve ser numérico.");
      }
      break;
    case "boolean":
      if (value !== "true" && value !== "false") {
        throw new ValidationException("Valor deve ser booleano ('true' ou 'false').");
      }
      break;
    case "date":
      if (isNaN(new Date(value).getTime())) {
        throw new ValidationException("Formato de data inválido.");

      }
      break;
  }

  const fill = await fillRepository.create(fieldId, value)
  return fill;
}

export async function listFills() {
  return fillRepository.findAllWithField()
}

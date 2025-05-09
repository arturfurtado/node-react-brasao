import { ValidationException } from "../exceptions/validateException";
import { fillRepository } from "../repositories/fill-repository";
import { fieldRepository } from "../repositories/field-repository";
import { Fill } from "../entities/fills";

function parseDate(value: string): Date | null {
  const [day, month, year] = value.split('/');
  if (!day || !month || !year) return null;

  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10) - 1;
  const yearNum = parseInt(year, 10);
  
  const date = new Date(yearNum, monthNum, dayNum);

  if (
    date.getFullYear() !== yearNum ||
    date.getMonth() !== monthNum ||
    date.getDate() !== dayNum
  ) {
    return null;
  }

  return date;
}

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
      const parsedDate = parseDate(value);
      console.log(parsedDate)
      if (!parsedDate) {
        throw new ValidationException("Formato de data inválido. Use DD/MM/YYYY.");
      }
      break;
  }

  const fill = await fillRepository.create(fieldId, value);
  return fill;
}

export async function listFills() {
  return fillRepository.findAllWithField();
}

export async function updateFill(id: string, value: string): Promise<Fill> {
  const fill = await fillRepository.findById(id);
  if (!fill) {
    throw new ValidationException("Fill não encontrado");
  }

  const field = await fieldRepository.findById(fill.fieldId);
  if (!field) {
    throw new ValidationException("Campo associado não encontrado");
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
      const parsedDate = parseDate(value);
      if (!parsedDate) {
        throw new ValidationException("Formato de data inválido. Use DD/MM/YYYY.");
      }
      break;
  }

  return fillRepository.update(id, { value });
}

export async function deleteFill(id: string): Promise<void> {
  const fill = await fillRepository.findById(id);
  if (!fill) {
    throw new ValidationException("Fill não encontrado");
  }
  await fillRepository.delete(id);
}

import {
  createFill,
  listFills,
  updateFill,
  deleteFill,
} from "../../services/fillService";
import { Field, DataType } from "../../entities/fields";
import { Fill } from "../../entities/fills";
import { fieldRepository } from "../../repositories/field-repository";
import { fillRepository } from "../../repositories/fill-repository";

jest.mock("../../repositories/field-repository");
jest.mock("../../repositories/fill-repository");

const fieldRepo = fieldRepository as jest.Mocked<typeof fieldRepository>;
const fillRepo = fillRepository as jest.Mocked<typeof fillRepository>;

describe("Fill Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createFill", () => {
    test("deve criar preenchimento com fieldId válido e value correto", async () => {
      fieldRepo.findById.mockResolvedValue({
        id: "1",
        name: "Teste",
        datatype: DataType.NUMBER,
        createdAt: new Date(),
        fills: [],
      } as any);

      fillRepo.create.mockResolvedValue({
        id: "1",
        fieldId: "1",
        value: "123",
        createdAt: new Date(),
        field: {} as any,
        parseValue: () => 123,
      } as any);

      const fill = await createFill("1", "123");
      expect(fill).toHaveProperty("id");
      expect(fill.fieldId).toBe("1");
      expect(fill.value).toBe("123");
    });

    test("deve lançar erro se fieldId não existir", async () => {
      fieldRepo.findById.mockResolvedValue(null);
      await expect(createFill("invalid-id", "123")).rejects.toThrow(
        "Campo nao encontrado"
      );
    });

    test("deve lançar erro se value não for numérico para datatype number", async () => {
      fieldRepo.findById.mockResolvedValue({
        id: "1",
        name: "Teste",
        datatype: DataType.NUMBER,
        createdAt: new Date(),
        fills: [],
      } as any);

      await expect(createFill("1", "abc")).rejects.toThrow(
        "Valor deve ser numérico."
      );
    });

    test("deve lançar erro se value não for booleano para datatype boolean", async () => {
      fieldRepo.findById.mockResolvedValue({
        id: "1",
        name: "Teste",
        datatype: DataType.BOOLEAN,
        createdAt: new Date(),
        fills: [],
      } as any);

      await expect(createFill("1", "abc")).rejects.toThrow(
        "Valor deve ser booleano ('true' ou 'false')."
      );
    });

    test("deve lançar erro se value não for data válida para datatype date", async () => {
      fieldRepo.findById.mockResolvedValue({
        id: "1",
        name: "Teste",
        datatype: DataType.DATE,
        createdAt: new Date(),
        fills: [],
      } as any);

      await expect(createFill("1", "abc")).rejects.toThrow(
        "Formato de data inválido."
      );
    });
  });

  describe("listFills", () => {
    test("deve retornar a lista de preenchimentos", async () => {
      const now = new Date();
      const dummyField: Field = {
        id: "1",
        name: "Teste",
        datatype: DataType.NUMBER,
        createdAt: now,
        fills: [],
      };
      const fill = {
        id: "1",
        fieldId: "1",
        value: "123",
        createdAt: now,
        field: dummyField,
        parseValue() {
          switch (this.field.datatype) {
            case DataType.NUMBER:
              return Number(this.value);
            case DataType.BOOLEAN:
              return this.value === "true";
            case DataType.DATE:
              return new Date(this.value);
            default:
              return this.value;
          }
        },
      } as Fill;
      fillRepo.findAllWithField.mockResolvedValue([fill]);
      const result = await listFills();
      expect(result).toEqual([fill]);
      expect(fillRepo.findAllWithField).toHaveBeenCalled();
    });
  });

  describe("updateFill", () => {
    const dummyField: Field = {
      id: "f1",
      name: "Teste",
      datatype: DataType.NUMBER,
      createdAt: new Date(),
      fills: [],
    };
    const dummyFill: Fill = {
      id: "x1",
      fieldId: "f1",
      value: "42",
      createdAt: new Date(),
      field: dummyField,
      parseValue() {
        return Number(this.value);
      },
    } as any;

    test("deve atualizar quando válido", async () => {
      fillRepo.findById.mockResolvedValue(dummyFill);
      fieldRepo.findById.mockResolvedValue(dummyField);
      fillRepo.update.mockResolvedValue({
        ...dummyFill,
        value: "99",
      } as any);

      const updated = await updateFill("x1", "99");
      expect(fillRepo.findById).toHaveBeenCalledWith("x1");
      expect(fieldRepo.findById).toHaveBeenCalledWith("f1");
      expect(updated.value).toBe("99");
    });

    test("deve lançar se fill não existir", async () => {
      fillRepo.findById.mockResolvedValue(null);
      await expect(updateFill("nope", "123")).rejects.toThrow(
        "Fill não encontrado"
      );
    });

    test("deve lançar se o valor for inválido (datatype number)", async () => {
      fillRepo.findById.mockResolvedValue(dummyFill);
      fieldRepo.findById.mockResolvedValue(dummyField);
      await expect(updateFill("x1", "abc")).rejects.toThrow(
        "Valor deve ser numérico."
      );
    });
  });

  describe("deleteFill", () => {
    const dummyFill: Fill = {
      id: "x1",
      fieldId: "f1",
      value: "42",
      createdAt: new Date(),
      field: {} as any,
      parseValue() {
        return Number(this.value);
      },
    } as any;

    test("deve deletar quando existir", async () => {
      fillRepo.findById.mockResolvedValue(dummyFill);
      await expect(deleteFill("x1")).resolves.toBeUndefined();
      expect(fillRepo.delete).toHaveBeenCalledWith("x1");
    });

    test("deve lançar se fill não existir", async () => {
      fillRepo.findById.mockResolvedValue(null);
      await expect(deleteFill("nope")).rejects.toThrow(
        "Fill não encontrado"
      );
    });
  });
});

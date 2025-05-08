import {
  createField,
  listFields,
  updateField,
  deleteField,
} from "../../services/fieldServices";
import { Field, DataType } from "../../entities/fields";
import { fieldRepository } from "../../repositories/field-repository";
import { fillRepository } from "../../repositories/fill-repository";
import { ValidationException } from "../../exceptions/validateException";

jest.mock("../../repositories/field-repository");
jest.mock("../../repositories/fill-repository");

const repo = fieldRepository as jest.Mocked<typeof fieldRepository>;
const fillRepo = fillRepository as jest.Mocked<typeof fillRepository>;

describe("Field Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createField", () => {
    test("deve criar um novo campo com nome único", async () => {
      repo.findByName.mockResolvedValue(null);
      const now = new Date();
      repo.create.mockResolvedValue({
        id: "generated-id",
        name: "Teste",
        datatype: DataType.STRING,
        createdAt: now,
        fills: [],
      } as unknown as Field);

      const field = await createField("Teste", DataType.STRING);

      expect(repo.findByName).toHaveBeenCalledWith("Teste");
      expect(repo.create).toHaveBeenCalledWith("Teste", DataType.STRING);
      expect(field).toMatchObject({
        id: "generated-id",
        name: "Teste",
        datatype: DataType.STRING,
        createdAt: now,
      });
      expect(field.fills).toEqual([]);
    });

    test("deve lançar erro se o nome já existir", async () => {
      repo.findByName.mockResolvedValue({
        id: "1",
        name: "Teste",
        datatype: DataType.STRING,
        createdAt: new Date(),
        fills: [
          {
            id: "f1",
            fieldId: "1",
            value: "dummy",
            createdAt: new Date(),
            field: {} as any,
          },
        ],
      } as unknown as Field);

      await expect(
        createField("Teste", DataType.STRING)
      ).rejects.toThrow("Esse nome já existe");
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe("listFields", () => {
    test("deve retornar a lista de campos ordenada com fills", async () => {
      const now = new Date();
      const sampleFill = {
        id: "f1",
        fieldId: "1",
        value: "abc",
        createdAt: now,
        field: {} as any,
        parseValue: () => "abc",
      };
      const fields: Field[] = [
        {
          id: "1",
          name: "Teste",
          datatype: DataType.STRING,
          createdAt: now,
          fills: [sampleFill],
        },
      ];
      repo.findAllWithFills.mockResolvedValue(fields as any);

      const result = await listFields();

      expect(repo.findAllWithFills).toHaveBeenCalled();
      expect(result).toEqual(fields);
      result.forEach((f, idx) => {
        expect(f.fills).toEqual(fields[idx].fills);
      });
    });
  });

  describe("updateField", () => {
    const existing: Field = {
      id: "1",
      name: "Origem",
      datatype: DataType.STRING,
      createdAt: new Date(),
      fills: [],
    };

    test("deve atualizar nome e datatype quando válido", async () => {
      repo.findById.mockResolvedValue(existing);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({
        ...existing,
        name: "Destino",
        datatype: DataType.NUMBER,
      } as any);

      const updated = await updateField(
        "1",
        "Destino",
        DataType.NUMBER
      );
      expect(repo.findById).toHaveBeenCalledWith("1");
      expect(repo.findByName).toHaveBeenCalledWith("Destino");
      expect(updated.name).toBe("Destino");
      expect(updated.datatype).toBe(DataType.NUMBER);
    });

    test("deve lançar se o field não existir", async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        updateField("x", "Novo", DataType.BOOLEAN)
      ).rejects.toBeInstanceOf(ValidationException);
    });

    test("deve lançar se tentar renomear para um nome já em uso", async () => {
      repo.findById.mockResolvedValue(existing);
      repo.findByName.mockResolvedValue({} as any);
      await expect(
        updateField("1", "OrigemDuplicada", DataType.STRING)
      ).rejects.toThrow("Esse nome já existe");
    });
  });
  describe("updateField", () => {
    const existing: Field = {
      id: "1",
      name: "Origem",
      datatype: DataType.STRING,
      createdAt: new Date(),
      fills: [],
    };

    test("deve lançar se tentar trocar datatype quando já há fills", async () => {
      repo.findById.mockResolvedValue(existing);
      repo.findByName.mockResolvedValue(null);
      fillRepo.findByFieldId.mockResolvedValue([
        { id: "f1", fieldId: "1", value: "abc", createdAt: new Date(), field: existing, parseValue: () => "abc" } as any,
      ]);

      await expect(
        updateField("1", existing.name, DataType.NUMBER)
      ).rejects.toThrow(
        "Não é possível alterar o tipo de um campo que já possui preenchimentos. Apague-os ou crie um novo campo."
      );
    });
  });


  describe("deleteField", () => {
    const existing: Field = {
      id: "1",
      name: "Origem",
      datatype: DataType.STRING,
      createdAt: new Date(),
      fills: [],
    };

    test("deve deletar quando existir", async () => {
      repo.findById.mockResolvedValue(existing);
      await expect(deleteField("1")).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith("1");
    });

    test("deve lançar se o field não existir", async () => {
      repo.findById.mockResolvedValue(null);
      await expect(deleteField("nope")).rejects.toThrow(
        "Campo não encontrado"
      );
    });
  });
});

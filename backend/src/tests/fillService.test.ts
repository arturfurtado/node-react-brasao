import { Fill } from '../entities/fills';
import { Field, DataType } from '../entities/fields';
import { createFill } from '../services/fillService';
import { listFills } from '../services/fillService';

const mockFillRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};
const mockFieldRepo = {
  findOne: jest.fn(),
};

jest.mock('../config/data-source', () => ({
  AppDataSource: {
    getRepository: jest
      .fn()
      .mockImplementation((entity) => {
        if (entity === Fill)  return mockFillRepo;
        if (entity === Field) return mockFieldRepo;
        throw new Error(`Unexpected repository: ${entity}`);
      }),
  },
}));

describe('Fill Service', () => {
  let fillRepo = mockFillRepo as jest.Mocked<typeof mockFillRepo>;
  let fieldRepo = mockFieldRepo as jest.Mocked<typeof mockFieldRepo>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createFill - deve criar preenchimento com fieldId válido e value correto', async () => {
    fieldRepo.findOne.mockResolvedValue({
      id: '1',
      name: 'Teste',
      datatype: DataType.NUMBER,
      createdAt: new Date(),
      fills: [],
    } as any);

    mockFillRepo.create.mockReturnValue({
      id: '1', fieldId: '1', value: '123', createdAt: new Date(), field: {} as any,
      parseValue: () => 123,
    } as any);
    mockFillRepo.save.mockResolvedValue({
      id: '1', fieldId: '1', value: '123', createdAt: new Date(), field: {} as any,
      parseValue: () => 123,
    } as any);

    const fill = await createFill('1', '123');
    expect(fill).toHaveProperty('id');
    expect(fill.fieldId).toBe('1');
    expect(fill.value).toBe('123');
  });

  test('createFill - deve lançar erro se fieldId não existir', async () => {
    fieldRepo.findOne.mockResolvedValue(null);

    await expect(createFill('invalid-id', '123')).rejects.toThrow('Campo não encontrado.');
  });

  test('createFill - deve lançar erro se value não for numérico para datatype number', async () => {
    fieldRepo.findOne.mockResolvedValue({
      id: '1',
      name: 'Teste',
      datatype: DataType.NUMBER,
      createdAt: new Date(),
      fills: [],
    });

    await expect(createFill('1', 'abc')).rejects.toThrow('Valor deve ser numérico.');
  });

  test('createFill - deve lançar erro se value não for booleano para datatype boolean', async () => {
    fieldRepo.findOne.mockResolvedValue({
      id: '1',
      name: 'Teste',
      datatype: DataType.BOOLEAN,
      createdAt: new Date(),
      fills: [],
    });

    await expect(createFill('1', 'abc')).rejects.toThrow("Valor deve ser booleano ('true' ou 'false').");
  });

  test('createFill - deve lançar erro se value não for data válida para datatype date', async () => {
    fieldRepo.findOne.mockResolvedValue({
      id: '1',
      name: 'Teste',
      datatype: DataType.DATE,
      createdAt: new Date(),
      fills: [],
    });

    await expect(createFill('1', 'abc')).rejects.toThrow('Formato de data inválido.');
  });

  test('listFills - deve retornar a lista de preenchimentos', async () => {
    const field = {
      id: '1',
      name: 'Teste',
      datatype: DataType.NUMBER,
      createdAt: new Date(),
      fills: [],
    };
  
    const fill = {
      id: '1',
      fieldId: '1',
      value: '123',
      createdAt: new Date(),
      field: field,
      parseValue: function (): string | number | boolean | Date {
        switch (this.field.datatype) {
          case DataType.NUMBER:
            return Number(this.value);
          case DataType.BOOLEAN:
            return this.value === 'true';
          case DataType.DATE:
            return new Date(this.value);
          default:
            return this.value;
        }
      },
    };
  
    const fills = [fill];
    fillRepo.find.mockResolvedValue(fills);
    const result = await listFills();
    expect(result).toEqual(fills);
    expect(fillRepo.find).toHaveBeenCalledWith({ relations: ['field'], order: { createdAt: 'ASC' } });
  });
});
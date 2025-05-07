import { createField, listFields } from '../services/fieldServices';
import { AppDataSource } from '../config/data-source';
import { Field, DataType } from '../entities/fields';
import { Repository } from 'typeorm';
import { Fill } from '../entities/fills';

jest.mock('../config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    }),
  },
}));

describe('Field Service', () => {
  let repo: jest.Mocked<Repository<Field>>;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = AppDataSource.getRepository(Field) as unknown as jest.Mocked<Repository<Field>>;
  });

  test('createField - deve criar um novo campo com nome único', async () => {
    repo.findOneBy.mockResolvedValue(null);

    const now = new Date();
    repo.create.mockReturnValue({
      id: 'generated-id',
      name: 'Teste',
      datatype: DataType.STRING,
      createdAt: now,
      fills: [],
    } as unknown as Field);

    repo.save.mockResolvedValue({
      id: 'generated-id',
      name: 'Teste',
      datatype: DataType.STRING,
      createdAt: now,
      fills: [],
    } as unknown as Field);

    const field = await createField('Teste', DataType.STRING);

    expect(repo.findOneBy).toHaveBeenCalledWith({ name: 'Teste' });
    expect(repo.create).toHaveBeenCalledWith({ name: 'Teste', datatype: DataType.STRING });
    expect(repo.save).toHaveBeenCalled();

    expect(field).toMatchObject({
      id: 'generated-id',
      name: 'Teste',
      datatype: DataType.STRING,
      createdAt: now,
    });
    expect(field.fills).toEqual([]);
  });

  test('createField - deve lançar erro se o nome já existir', async () => {
    repo.findOneBy.mockResolvedValue({
      id: '1',
      name: 'Teste',
      datatype: DataType.STRING,
      createdAt: new Date(),
      fills: [
        { id: 'f1', fieldId: '1', value: 'dummy', createdAt: new Date(), field: {} as any },
      ],
    } as unknown as Field);

    await expect(createField('Teste', DataType.STRING))
      .rejects.toThrow('Já existe um campo com esse nome.');

    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  test('listFields - deve retornar a lista de campos ordenada com fills', async () => {
    const now = new Date();
    const sampleFill = { id: 'f1', fieldId: '1', value: 'abc', createdAt: now, parseValue:  ()=> 'abc' , field: {} as any };
    const fields: Field[] = [
      {
        id: '1',
        name: 'Teste',
        datatype: DataType.STRING,
        createdAt: now,
        fills: [sampleFill],
      },
    ];
    repo.find.mockResolvedValue(fields as any);

    const result = await listFields();

    expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'ASC' } });
    expect(result).toEqual(fields);
    result.forEach((f, idx) => {
      expect(f.fills).toEqual(fields[idx].fills);
    });
  });
});

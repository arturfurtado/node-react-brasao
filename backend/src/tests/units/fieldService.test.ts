import { createField, listFields } from '../../services/fieldServices';
import { AppDataSource } from '../../config/data-source';
import { Field, DataType } from '../../entities/fields';
import { FieldRepository, fieldRepository } from '../../repositories/field-repository';

jest.mock('../../repositories/field-repository', () => ({
  fieldRepository:{
      findByName: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findAllWithFills: jest.fn(),
    },
}));

describe('Field Service', () => {
  let repo: jest.Mocked<FieldRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = fieldRepository as jest.Mocked<FieldRepository>;
  });

  test('createField - deve criar um novo campo com nome único', async () => {
    repo.findById.mockResolvedValue(null);
    const now = new Date();

    repo.create.mockResolvedValue({
      id: 'generated-id',
      name: 'Teste',
      datatype: DataType.STRING,
      createdAt: now,
      fills: [],
    } as unknown as Field);

    const field = await createField('Teste', DataType.STRING);

    expect(repo.findByName).toHaveBeenCalledWith('Teste');
    expect(repo.create).toHaveBeenCalledWith('Teste', DataType.STRING);

    expect(field).toMatchObject({
      id: 'generated-id',
      name: 'Teste',
      datatype: DataType.STRING,
      createdAt: now,
    });
    expect(field.fills).toEqual([]);
  });

  test('createField - deve lançar erro se o nome já existir', async () => {
    repo.findByName.mockResolvedValue({
      id: '1',
      name: 'Teste',
      datatype: DataType.STRING,
      createdAt: new Date(),
      fills: [
        { id: 'f1', fieldId: '1', value: 'dummy', createdAt: new Date(), field: {} as any },
      ],
    } as unknown as Field);

    await expect(createField('Teste', DataType.STRING))
      .rejects.toThrow('Esse nome ja existe');

    expect(repo.create).not.toHaveBeenCalled();
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
    repo.findAllWithFills.mockResolvedValue(fields as any);

    const result = await listFields();

    expect(repo.findAllWithFills).toHaveBeenCalled()
    expect(result).toEqual(fields);
    result.forEach((f, idx) => {
      expect(f.fills).toEqual(fields[idx].fills);
    });
  });
});

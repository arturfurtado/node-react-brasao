import { createField, listFields } from '../services/fieldServices';
import { AppDataSource } from '../config/data-source';
import { Field, DataType } from '../entities/fields';
import { Repository } from 'typeorm';

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
    repo.create.mockReturnValue({
        name: 'Teste', datatype: DataType.STRING,
        id: '',
        createdAt: new Date(),
        fills: []
    });
    repo.save.mockResolvedValue({
      id: '1',
      name: 'Teste',
      datatype: DataType.STRING,
      createdAt: new Date(),
      fills: [] 
    });

    const field = await createField('Teste', DataType.STRING);
    expect(field).toHaveProperty('id');
    expect(field.name).toBe('Teste');
    expect(field.datatype).toBe(DataType.STRING);
  });

  test('createField - deve lançar erro se o nome já existir', async () => {
    repo.findOneBy.mockResolvedValue({
      id: '1',
      name: 'Teste',
      datatype: DataType.STRING,
      createdAt: new Date(),
      fills: [] 
    });

    await expect(createField('Teste', DataType.STRING)).rejects.toThrow('Já existe um campo com esse nome.');
  });

  test('listFields - deve retornar a lista de campos ordenada', async () => {
    const fields = [{
      id: '1',
      name: 'Teste',
      datatype: DataType.STRING,
      createdAt: new Date(),
      fills: [] 
    }];
    repo.find.mockResolvedValue(fields);

    const result = await listFields();
    expect(result).toEqual(fields);
    expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'ASC' } });
  });
});



// adicionar fills nos arrays mais tarde
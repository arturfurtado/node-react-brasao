import { z } from 'zod';

export const DataTypeEnum = z.enum(['string', 'number', 'boolean', 'date'], {
  required_error: "O tipo de dado é obrigatório.", 
  invalid_type_error: "Por favor, selecione um tipo de dado válido.",
});
export type DataType = z.infer<typeof DataTypeEnum>;

export const FieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  datatype: DataTypeEnum,
  createdAt: z.string().refine((d) => !isNaN(Date.parse(d)), { 
    message: 'Data de criação inválida para o campo',
  }),
});

export const FillSchema = z.object({
  id: z.string(),
  fieldId: z.string(),
  value: z.string(),
  createdAt: z.string().refine((d) => !isNaN(Date.parse(d)), { 
    message: 'Data de criação inválida para o preenchimento',
  }),
  field: FieldSchema.optional(), 
});

export const FillPostSchema = z.object({
  fieldId: z.string().min(1, 'A referência ao campo (fieldId) é obrigatória.'), 
  value: z.string().min(1, 'O valor é obrigatório.'), 
});

export const FieldPostSchema = z.object({
  name: z.string().min(1, 'O nome do campo é obrigatório.'), 
  datatype: DataTypeEnum, 
});


export const DateStringDDMMYYYYSchema = z.string()
  .min(10, 'A data deve estar no formato DD/MM/AAAA e ter 10 caracteres.')
  .max(10, 'A data deve estar no formato DD/MM/AAAA e ter 10 caracteres.')
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato de data inválido. Use DD/MM/AAAA.')
  .refine((dateStr) => {
    const parts = dateStr.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000 || year > 3000) {
      return false;
    }
    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  }, {
    message: 'Data inválida (ex: 30/02/2024 ou data não existente).',
  });

export type FieldPost = z.infer<typeof FieldPostSchema>;

export const FieldsResponseSchema = z.array(FieldSchema);

export const FillsResponseSchema = z.array(FillSchema);

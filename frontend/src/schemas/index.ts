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
export type FieldPost = z.infer<typeof FieldPostSchema>;

export const FieldsResponseSchema = z.array(FieldSchema);

export const FillsResponseSchema = z.array(FillSchema);

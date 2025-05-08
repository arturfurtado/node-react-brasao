import { z } from 'zod';

export const DataTypeEnum = z.enum(['string', 'number', 'boolean', 'date']);
export type DataType = z.infer<typeof DataTypeEnum>;

export const FieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  datatype: DataTypeEnum,
  createdAt: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: 'Data inválida',
  }),
});

export const FillSchema = z.object({
  id: z.string(),
  fieldId: z.string(),
  value: z.string(),
  createdAt: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: 'Data inválida',
  }),
  field: FieldSchema.optional(),
});

export const FillPostSchema = z.object({
  fieldId: z.string().min(1, 'Campo obrigatório'),
  value: z.string().min(1, 'Valor obrigatório'),
});

export const FieldPostSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  datatype: DataTypeEnum,
})
export type FieldPost = z.infer<typeof FieldPostSchema>

export const FieldsResponseSchema = z.array(FieldSchema);
export const FillsResponseSchema = z.array(FillSchema);

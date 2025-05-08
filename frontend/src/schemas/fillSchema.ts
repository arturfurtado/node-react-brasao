import {z} from 'zod'

export const FieldSchema = z.object({
    id: z.string(),
    name: z.string(),
    datatype: z.string(),
})

export const FillSchema = z.object({
    id: z.string(),
    fieldId: z.string(),
    value: z.string(),
    createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data invalida'
    }),
})

export const FillPostSchema = z.object({
    fieldId: z.string().min(1, 'Campo Obrigatorio'),
    value: z.string().min(1, 'Valor Obrigatorio'),
})

export const FieldsResponseSchema = z.array(FieldSchema);
export const FillsResponseSchema = z.array(FillSchema)
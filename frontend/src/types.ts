import { z } from 'zod'
import { FieldSchema, FillSchema } from './schemas'

export type Field = z.infer<typeof FieldSchema>
export type Fill  = z.infer<typeof FillSchema>

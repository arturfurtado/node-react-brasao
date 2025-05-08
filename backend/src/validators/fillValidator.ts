import { object, string, z } from "zod";

export const createFillSchema = z.object({
  value: z.string().min(1, "O valor é obrigatório"),
  fieldId: z.string().min(1, "O ID do campo (fieldId) é obrigatório"),
});

export const updateFillSchema = z.object({
  value: z.string().min(1, "O valor é obrigatório"),
});

import { z } from "zod";
import { DataType } from "../entities/fields";

export const createFieldSchema = z.object({
  name: z.string().min(1, "name é obrigatório"),
  datatype: z.nativeEnum(DataType)
});

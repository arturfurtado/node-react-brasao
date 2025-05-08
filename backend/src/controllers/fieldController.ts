import * as fieldSvc from "../services/fieldServices";
import {
  makeCreateHandler,
  makeListHandler,
  makeUpdateHandler,
  makeDeleteHandler,
} from "../utils/http";
import { DataType } from "../entities/fields";

export const createField = makeCreateHandler(
  ({ name, datatype }: { name: string; datatype: DataType }) =>
    fieldSvc.createField(name, datatype)
);
export const getFields = makeListHandler(fieldSvc.listFields);

export const updateField = makeUpdateHandler(
  (id: string, { name, datatype }: { name: string; datatype: DataType }) =>
    fieldSvc.updateField(id, name, datatype)
);

export const deleteField = makeDeleteHandler(fieldSvc.deleteField);

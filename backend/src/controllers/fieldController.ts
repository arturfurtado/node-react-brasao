import * as fieldSvc from "../services/fieldServices";
import { makeCreateHandler, makeListHandler } from "../utils/http";
import { DataType } from "../entities/fields";  

export const createField = makeCreateHandler(
  ({ name, datatype }: { name: string; datatype: DataType }) =>
    fieldSvc.createField(name, datatype)
);

export const getFields = makeListHandler(fieldSvc.listFields);

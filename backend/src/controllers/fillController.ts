import * as fillSvc from "../services/fillService";
import { makeCreateHandler, makeListHandler } from "../utils/http";

export const createFill = makeCreateHandler(
  ({ fieldId, value }: { fieldId: string; value: string }) =>
    fillSvc.createFill(fieldId, value)
);

export const getFills = makeListHandler(fillSvc.listFills);

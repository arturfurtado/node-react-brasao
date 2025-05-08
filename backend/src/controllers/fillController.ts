import * as fillSvc from "../services/fillService";
import {
  makeCreateHandler,
  makeListHandler,
  makeUpdateHandler,
  makeDeleteHandler,
} from "../utils/http";

export const createFill = makeCreateHandler(
  ({ fieldId, value }: { fieldId: string; value: string }) =>
    fillSvc.createFill(fieldId, value)
);
export const getFills = makeListHandler(fillSvc.listFills);

export const updateFill = makeUpdateHandler(
  (id: string, { value }: { value: string }) =>
    fillSvc.updateFill(id, value)
);

export const deleteFill = makeDeleteHandler(fillSvc.deleteFill);

import type { NodeDefinition } from "../types";
import type { NodeSchema } from "@node-playground/types";
import { SET_FIELDS, SetNodeConfigSchema } from "./schema";
import { runSetNode } from "./runtime";

const SET_SCHEMA: NodeSchema = {
  key: "set",
  name: "SET",
  type: "utility",
  inputs: SET_FIELDS,
  outputs: [{ key: "transformed", type: "object" }],
};

export const setNode: NodeDefinition = {
  key: "set",
  schema: SET_SCHEMA,
  run: runSetNode,
  createInitialConfig: () => ({
    includeOtherFields: true,
    fields: [],
  }),
};

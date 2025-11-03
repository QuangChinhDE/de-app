import type { NodeDefinition } from "../types";
import { SPLIT_SCHEMA, SplitNodeConfigSchema } from "./schema";
import { runSplitNode } from "./runtime";

export const splitNode: NodeDefinition = {
  key: "split",
  schema: SPLIT_SCHEMA,
  createInitialConfig: () =>
    SplitNodeConfigSchema.parse({
      fields: [],
      includeMode: "all",
      selectedFields: [],
    }),
  run: runSplitNode,
};

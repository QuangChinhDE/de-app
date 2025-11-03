import type { NodeDefinition } from "../types";
import { SPLIT_SCHEMA, SplitNodeConfigSchema } from "./schema";
import { runSplitNode } from "./runtime";
import { SplitForm } from "./SplitForm";

export const splitNode: NodeDefinition = {
  key: "split",
  schema: {
    ...SPLIT_SCHEMA,
    formComponent: SplitForm,
  },
  createInitialConfig: () =>
    SplitNodeConfigSchema.parse({
      fields: [],
      includeMode: "all",
      selectedFields: [],
    }),
  run: runSplitNode,
};

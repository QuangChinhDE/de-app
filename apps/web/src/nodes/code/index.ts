import type { NodeDefinition } from "../types";
import { CODE_SCHEMA } from "./schema";
import { runCodeNode } from "./runtime";

export const codeNode: NodeDefinition = {
  key: "code",
  schema: CODE_SCHEMA,
  createInitialConfig: () => ({
    code: "// Access input via 'input' variable\n// Example: transform array\nreturn input.map(item => ({\n  ...item,\n  processed: true\n}));",
    inputData: "",
  }),
  run: runCodeNode,
};

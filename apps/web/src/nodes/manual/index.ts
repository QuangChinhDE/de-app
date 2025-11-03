import type { NodeDefinition } from "../types";
import { MANUAL_SCHEMA } from "./schema";
import { runManualNode } from "./runtime";
import { ManualForm } from "./ManualForm";

export const manualNode: NodeDefinition = {
  key: "manual",
  schema: {
    ...MANUAL_SCHEMA,
    formComponent: ManualForm,
  },
  createInitialConfig: () => ({
    mode: "json",
    jsonPayload: `[
  {"id": 1, "name": "Alice", "status": "active", "age": 25},
  {"id": 2, "name": "Bob", "status": "inactive", "age": 30},
  {"id": 3, "name": "Charlie", "status": "active", "age": 35},
  {"id": 4, "name": "David", "status": "pending", "age": 28},
  {"id": 5, "name": "Eve", "status": "active", "age": 22}
]`,
    formFields: [
      { fieldName: "users", fieldType: "array", fieldValue: '[{"id":1,"name":"Alice","status":"active"},{"id":2,"name":"Bob","status":"inactive"}]' },
    ],
  }),
  run: runManualNode,
};

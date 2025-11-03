import type { NodeDefinition } from "../types";
import { SORT_SCHEMA } from "./schema";
import { runSortNode } from "./runtime";
import { SortForm } from "./SortForm";

export const sortNode: NodeDefinition = {
  key: "sort",
  schema: {
    ...SORT_SCHEMA,
    formComponent: SortForm,
  },
  createInitialConfig: () => ({
    items: "",
    field: "",
    direction: "asc",
    dataType: "auto",
  }),
  run: runSortNode,
};

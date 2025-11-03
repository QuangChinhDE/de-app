import type { FieldDef, NodeSchema } from "@node-playground/types";

const MERGE_FIELDS: FieldDef[] = [
  {
    key: "mode",
    label: "Merge Mode",
    type: "enum",
    enum: ["append", "merge", "join"],
    required: true,
    default: "append",
    help: "append: Combine arrays | merge: Combine objects | join: SQL-like join on key",
    group: "inputs",
  },
  
  {
    key: "inputCount",
    label: "Number of Inputs",
    type: "number",
    required: true,
    default: 2,
    min: 2,
    max: 5,
    help: "How many input handles to create (2-5). JOIN mode uses only first 2 inputs.",
    group: "inputs",
  },
  
  // APPEND mode options
  {
    key: "removeDuplicates",
    label: "Remove Duplicates",
    type: "boolean",
    default: false,
    help: "Remove duplicate items when appending arrays (compares JSON.stringify)",
    group: "inputs",
  },
  
  // MERGE mode options
  {
    key: "mergeStrategy",
    label: "Conflict Strategy",
    type: "enum",
    enum: ["last-wins", "first-wins", "combine-array"],
    default: "last-wins",
    help: "How to handle duplicate keys: last-wins (override) | first-wins (keep first) | combine-array (collect all)",
    group: "inputs",
  },
  
  // JOIN mode options
  {
    key: "joinKey1",
    label: "Join Key (Input 1)",
    type: "string",
    default: "id",
    placeholder: "id",
    help: "Field name to match in first array (e.g., 'id', 'userId')",
    group: "inputs",
  },
  {
    key: "joinKey2",
    label: "Join Key (Input 2)",
    type: "string",
    default: "id",
    placeholder: "userId",
    help: "Field name to match in second array (e.g., 'id', 'userId')",
    group: "inputs",
  },
  {
    key: "joinType",
    label: "Join Type",
    type: "enum",
    enum: ["inner", "left", "outer"],
    default: "inner",
    help: "inner: Only matches | left: All from Input 1 + matches from Input 2 | outer: All from both",
    group: "inputs",
  },
  {
    key: "flattenJoined",
    label: "Flatten Result",
    type: "boolean",
    default: true,
    help: "true: Merge properties into one object | false: Keep nested {left: ..., right: ...}",
    group: "inputs",
  },
];

export const MERGE_SCHEMA: NodeSchema = {
  key: "merge",
  name: "Merge",
  type: "utility",
  inputs: MERGE_FIELDS,
  outputs: [
    { key: "output", type: "object" },
  ],
};

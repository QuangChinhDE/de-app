import type { NodeDefinition } from "../types";
import { HTTP_SCHEMA } from "./schema";
import { runHttpNode } from "./runtime";

export const httpNode: NodeDefinition = {
  key: "http",
  schema: HTTP_SCHEMA,
  createInitialConfig: () => ({
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/users/1",
    bodyMode: "none",
    queryParams: [],
    headers: [],
    formBody: [],
    multipartBody: [],
    authType: "none",
    timeoutMs: 30000,
    retryCount: 0,
    retryBackoff: "none",
    followRedirects: true,
  }),
  run: runHttpNode,
};

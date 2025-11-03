import type { HttpNodeConfig, HttpRunResult } from "@node-playground/types";
import { executeHttpNode } from "../../services/http-client";
import { maskSensitive } from "../../utils/expression";
import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";

export async function runHttpNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const httpConfig = normalizeHttpConfig(args.resolvedConfig);
  const result = await executeHttpNode(httpConfig);

  // Only return essential response data
  const output = {
    status: result.metadata.status,
    headers: result.responseHeaders,
    body: result.responseBody,
  };

  return {
    output,
    status: result.metadata.status,
    durationMs: result.metadata.durationMs,
    requestPreview: {
      ...result.requestPreview,
      headers: maskSensitive(result.requestPreview.headers),
    },
    response: result,
  };
}

function normalizeHttpConfig(config: Record<string, unknown>): HttpNodeConfig {
  const method = (config.method as HttpNodeConfig["method"]) ?? "GET";
  const headers = ensureArrayOfPairs(config.headers);
  const queryParams = ensureArrayOfPairs(config.queryParams);
  
  // Map new field names to old ones for backward compatibility
  const formDataBody = ensureArrayOfPairs(config.formDataBody);
  const formUrlEncodedBody = ensureArrayOfPairs(config.formUrlEncodedBody);
  
  // Support old field names too
  const legacyFormBody = ensureArrayOfPairs(config.formBody);
  const legacyMultipartBody = ensureArrayOfPairs(config.multipartBody);

  const bodyMode = (config.bodyMode as string) ?? "none";
  const authType = (config.authType as string) ?? "none";

  const retryBackoff = config.retryBackoff as string;
  
  // Map new body modes to internal format
  let internalBodyMode: HttpNodeConfig["bodyMode"] = undefined;
  if (bodyMode === "json") {
    internalBodyMode = "json";
  } else if (bodyMode === "form-data") {
    internalBodyMode = "multipart";
  } else if (bodyMode === "x-www-form-urlencoded") {
    internalBodyMode = "form";
  } else if (bodyMode === "raw") {
    internalBodyMode = "raw";
  }
  
  return {
    method,
    url: String(config.url ?? ""),
    queryParams,
    headers,
    bodyMode: internalBodyMode,
    jsonBody: config.jsonBody as string | undefined,
    rawBody: config.rawBody as string | undefined,
    formBody: formUrlEncodedBody.length > 0 ? formUrlEncodedBody : legacyFormBody,
    multipartBody: (formDataBody.length > 0 ? formDataBody : legacyMultipartBody).map((row) => ({
      key: row.key,
      value: row.value,
      type: row.type === "file" ? "file" : "text",
    })),
    authType: authType as HttpNodeConfig["authType"],
    authBearerToken: config.authBearerToken as string | undefined,
    authBasicUsername: config.authBasicUsername as string | undefined,
    authBasicPassword: config.authBasicPassword as string | undefined,
    timeoutMs: config.timeoutMs ? Number(config.timeoutMs) : undefined,
    retryCount: config.retryCount ? Number(config.retryCount) : undefined,
    retryBackoff: retryBackoff === "none" ? undefined : (retryBackoff as HttpNodeConfig["retryBackoff"]),
    followRedirects:
      typeof config.followRedirects === "boolean" ? config.followRedirects : true,
  };
}

type KeyValue = {
  key: string;
  value: string;
  sensitive?: boolean;
  type?: string;
};

function ensureArrayOfPairs(input: unknown): KeyValue[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((row) => row && typeof row === "object" && "key" in (row as Record<string, unknown>))
    .map((row) => ({
      key: String((row as KeyValue).key ?? ""),
      value: String((row as KeyValue).value ?? ""),
      sensitive: Boolean((row as KeyValue).sensitive),
      type: (row as KeyValue).type,
    }))
    .filter((row) => row.key.length > 0);
}

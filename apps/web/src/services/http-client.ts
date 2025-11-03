import axios from "axios";
import type { HttpNodeConfig, HttpRunResult } from "@node-playground/types";

export async function executeHttpNode(config: HttpNodeConfig): Promise<HttpRunResult> {
  const response = await axios.post<{ data: HttpRunResult }>("/api/http/run", config, {
    timeout: config.timeoutMs ?? 15000,
  });
  return response.data.data;
}

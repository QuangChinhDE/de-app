import cors from "cors";
import express from "express";
import pRetry from "p-retry";
import { Headers, FormData, fetch } from "undici";
import { z } from "zod";
const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
const keyValueSchema = z
    .array(z.object({
    key: z.string().min(1),
    value: z.string().optional(),
    sensitive: z.boolean().optional(),
    type: z.string().optional(),
}))
    .default([]);
const httpConfigSchema = z.object({
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    url: z.string().url(),
    queryParams: keyValueSchema.optional(),
    headers: keyValueSchema.optional(),
    bodyMode: z.enum(["json", "form", "multipart", "raw"]).optional(),
    jsonBody: z.string().optional(),
    rawBody: z.string().optional(),
    formBody: keyValueSchema.optional(),
    multipartBody: keyValueSchema.optional(),
    authType: z.enum(["none", "bearer", "basic"]).default("none"),
    authBearerToken: z.string().optional(),
    authBasicUsername: z.string().optional(),
    authBasicPassword: z.string().optional(),
    timeoutMs: z.number().min(100).max(60000).optional(),
    retryCount: z.number().min(0).max(5).optional(),
    retryBackoff: z.enum(["linear", "exponential"]).optional(),
    followRedirects: z.boolean().optional(),
});
app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});
app.post("/api/http/run", async (req, res) => {
    const parsed = httpConfigSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.format() });
    }
    try {
        const result = await executeHttp(parsed.data);
        return res.json({ data: result });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        const status = error.status ?? 502;
        const payload = error.payload;
        return res.status(status).json({ error: { message }, data: payload });
    }
});
const PORT = resolvePort();
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
const DEFAULT_TIMEOUT = 15000;
async function executeHttp(config) {
    const url = buildUrl(config.url, config.queryParams ?? []);
    const headers = buildHeaders(config.headers ?? []);
    applyAuth(headers, config);
    const requestBody = buildRequestBody(config);
    const requestPreview = buildRequestPreview({
        method: config.method,
        url,
        headers,
        body: requestBody.preview,
    });
    const attempt = async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? DEFAULT_TIMEOUT);
        const start = Date.now();
        const response = await fetch(url, {
            method: config.method,
            headers,
            body: requestBody.body,
            redirect: config.followRedirects === false ? "manual" : "follow",
            signal: controller.signal,
        });
        const arrayBuffer = await response.arrayBuffer();
        clearTimeout(timeout);
        const rawBody = new TextDecoder("utf-8").decode(arrayBuffer);
        const size = new TextEncoder().encode(rawBody).byteLength;
        const durationMs = Date.now() - start;
        const responseHeaders = Object.fromEntries(response.headers.entries());
        const contentType = response.headers.get("content-type") ?? "";
        const responseBody = parseResponseBody(rawBody, contentType);
        const metadata = {
            status: response.status,
            statusText: response.statusText,
            durationMs,
            size,
        };
        if (!response.ok) {
            const error = new Error(`Request failed with status ${response.status}`);
            error.status = response.status;
            error.payload = {
                metadata,
                requestPreview,
                responseBody,
                responseHeaders,
                rawBody,
            };
            throw error;
        }
        return {
            metadata,
            requestPreview,
            responseBody,
            responseHeaders,
            rawBody,
        };
    };
    const retries = config.retryCount ?? 0;
    if (retries <= 0) {
        return attempt();
    }
    const backoff = config.retryBackoff === "linear" ? { factor: 1, minTimeout: 400 } : { factor: 2, minTimeout: 500 };
    return pRetry(attempt, {
        retries,
        minTimeout: backoff.minTimeout,
        factor: backoff.factor,
    });
}
function buildUrl(baseUrl, params) {
    const url = new URL(baseUrl);
    params
        .filter((param) => param.key && typeof param.value !== "undefined")
        .forEach((param) => {
        url.searchParams.append(param.key, param.value ?? "");
    });
    return url.toString();
}
function buildHeaders(entries) {
    const headers = new Headers();
    entries.filter((entry) => entry.key).forEach((entry) => {
        headers.set(entry.key, entry.value ?? "");
    });
    return headers;
}
function applyAuth(headers, config) {
    if (config.authType === "bearer" && config.authBearerToken) {
        headers.set("Authorization", `Bearer ${config.authBearerToken}`);
    }
    if (config.authType === "basic" && config.authBasicUsername) {
        const token = encodeBase64(`${config.authBasicUsername}:${config.authBasicPassword ?? ""}`);
        headers.set("Authorization", `Basic ${token}`);
    }
}
function buildRequestBody(config) {
    switch (config.bodyMode) {
        case "json":
            if (!config.jsonBody) {
                return { body: undefined, preview: undefined };
            }
            const sanitized = config.jsonBody.trim();
            try {
                JSON.parse(sanitized);
            }
            catch (error) {
                throw new Error(`Invalid JSON body: ${error.message}`);
            }
            return {
                body: sanitized,
                preview: JSON.parse(sanitized),
            };
        case "form": {
            const params = new URLSearchParams();
            for (const entry of config.formBody ?? []) {
                if (entry.key) {
                    params.append(entry.key, entry.value ?? "");
                }
            }
            return { body: params, preview: Object.fromEntries(params.entries()) };
        }
        case "multipart": {
            const form = new FormData();
            const preview = {};
            for (const entry of config.multipartBody ?? []) {
                if (!entry.key) {
                    continue;
                }
                const value = entry.value ?? "";
                form.append(entry.key, value);
                preview[entry.key] = value.length > 120 ? `${value.slice(0, 120)}…` : value;
            }
            return { body: form, preview };
        }
        case "raw": {
            const rawText = config.rawBody ?? "";
            return {
                body: rawText,
                preview: rawText.length > 200 ? `${rawText.slice(0, 200)}…` : rawText,
            };
        }
        default:
            return { body: undefined, preview: undefined };
    }
}
function parseResponseBody(raw, contentType) {
    if (contentType.includes("json")) {
        try {
            return JSON.parse(raw);
        }
        catch {
            return raw;
        }
    }
    return raw;
}
function buildRequestPreview(args) {
    const sanitizedHeaders = {};
    args.headers.forEach((value, key) => {
        sanitizedHeaders[key] = isSensitiveHeader(key) ? "••••" : value;
    });
    const headerArgs = Object.entries(sanitizedHeaders)
        .map(([key, value]) => `-H '${key}: ${value}'`)
        .join(" ");
    let bodyArg = "";
    if (typeof args.body === "string" && args.body.length) {
        bodyArg = `--data '${args.body}'`;
    }
    else if (typeof args.body === "object" && args.body !== null) {
        bodyArg = `--data '${JSON.stringify(args.body)}'`;
    }
    const curl = [`curl -X ${args.method}`, `'${args.url}'`, headerArgs, bodyArg]
        .filter(Boolean)
        .join(" ");
    return {
        curl,
        headers: sanitizedHeaders,
        body: args.body,
    };
}
function resolvePort() {
    const env = globalThis.process?.env;
    const raw = env?.PORT;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 4000;
}
function isSensitiveHeader(name) {
    const lower = name.toLowerCase();
    return lower.includes("authorization") || lower.includes("token") || lower.includes("secret");
}
function encodeBase64(value) {
    if (typeof btoa === "function") {
        return btoa(value);
    }
    const maybeBuffer = globalThis.Buffer;
    if (maybeBuffer) {
        return maybeBuffer.from(value, "utf-8").toString("base64");
    }
    return value;
}
//# sourceMappingURL=index.js.map
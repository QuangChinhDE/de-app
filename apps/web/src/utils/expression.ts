type TokenContext = Record<string, unknown>;

const TOKEN_REGEX = /\{\{\s*steps\.([\w-]+)([^}]*)\}\}/g;

const SENSITIVE_KEYS = ["password", "token", "authorization", "secret", "apiKey"];

export function resolveTokens<T>(value: T, context: TokenContext): T {
  return resolveValue(value, context) as T;
}

function resolveValue(value: unknown, context: TokenContext): unknown {
  if (typeof value === "string") {
    return resolveString(value, context);
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, context));
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, val]) => [key, resolveValue(val, context)] as const
    );
    return Object.fromEntries(entries);
  }

  return value;
}

function resolveString(template: string, context: TokenContext): unknown {
  const matches = Array.from(template.matchAll(TOKEN_REGEX));
  if (matches.length === 0) {
    return template;
  }

  const isPureToken = matches.length === 1 && matches[0][0].trim() === template.trim();

  let resolvedString = template;
  for (const match of matches) {
    const [fullMatch, stepKey, pathPart] = match;
    const target = context[`steps.${stepKey}`];
    if (typeof target === "undefined") {
      resolvedString = resolvedString.replace(fullMatch, "");
      continue;
    }

    const value = getPathValue(target, pathPart);
    const normalized = typeof value === "undefined" ? "" : value;

    if (isPureToken) {
      return normalized;
    }

    resolvedString = resolvedString.replace(fullMatch, String(normalized));
  }

  return resolvedString;
}

export function getPathValue(target: unknown, pathPart: string): unknown {
  if (!pathPart) {
    return target;
  }

  const trimmed = pathPart.replace(/^\./, "");
  const segments = trimmed
    .split(/\.|\[(\d+)\]/)
    .filter(Boolean)
    .map((seg) => seg.replace(/^['"]|['"]$/g, ""));

  let cursor: unknown = target;
  for (const segment of segments) {
    if (cursor === null || typeof cursor !== "object") {
      return undefined;
    }
    
    // Auto-unwrap arrays: if cursor is array and we're accessing a field (not index), get first item
    if (Array.isArray(cursor) && cursor.length > 0) {
      const index = Number(segment);
      if (!Number.isNaN(index)) {
        // Accessing by index like [0]
        cursor = cursor[index];
      } else {
        // Accessing by field name - auto-unwrap to first item then access field
        cursor = cursor[0];
        if (cursor && typeof cursor === "object") {
          cursor = (cursor as Record<string, unknown>)[segment];
        } else {
          return undefined;
        }
      }
    } else {
      const index = Number(segment);
      if (!Number.isNaN(index) && Array.isArray(cursor)) {
        cursor = cursor[index];
      } else {
        cursor = (cursor as Record<string, unknown>)[segment];
      }
    }
  }

  return cursor;
}

export function maskSensitive<T>(value: T, parentKey?: string): T {
  if (typeof value === "string" && parentKey) {
    const isSensitive = SENSITIVE_KEYS.some((key) =>
      parentKey.toLowerCase().includes(key)
    );
    if (isSensitive) {
      return "••••" as unknown as T;
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => maskSensitive(item)) as unknown as T;
  }

  if (value !== null && typeof value === "object") {
    if (
      "sensitive" in (value as Record<string, unknown>) &&
      (value as Record<string, unknown>).sensitive
    ) {
      return {
        ...(value as Record<string, unknown>),
        value: "••••",
      } as unknown as T;
    }
    const entries = Object.entries(value as Record<string, unknown>).map(([key, val]) => [
      key,
      maskSensitive(val, key),
    ]);
    return Object.fromEntries(entries) as unknown as T;
  }

  return value;
}

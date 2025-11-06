import type { NodeRuntimeArgs, NodeRuntimeResult } from "../types";
import { log } from "../../utils/logger";

interface FormField {
  fieldName: string;
  fieldType: string;
  fieldValue: string;
}

export async function runManualNode(args: NodeRuntimeArgs): Promise<NodeRuntimeResult> {
  const mode = String(args.resolvedConfig.mode ?? "json");
  const context = { nodeKey: args.currentNodeKey, nodeType: 'manual', mode };

  if (mode === "json") {
    // JSON mode: parse JSON payload
    const payloadText = String(args.resolvedConfig.jsonPayload ?? "{}");
    let parsed: unknown;

    try {
      parsed = payloadText.trim() ? JSON.parse(payloadText) : {};
      
      // Auto-unwrap single-item array (common pattern for testing)
      // Example: [{ id: 1, data: {...} }] → { id: 1, data: {...} }
      if (Array.isArray(parsed) && parsed.length === 1) {
        log.debug('Auto-unwrapping single-item array', { ...context, beforeUnwrap: parsed });
        parsed = parsed[0];
      }
      
      log.dataFlow('Manual node output (JSON mode)', { ...context, output: parsed });
    } catch (error) {
      log.error('Invalid JSON payload', error, context);
      throw new Error(`Invalid JSON payload: ${(error as Error).message}`);
    }

    return { output: parsed };
  } else {
    // Form mode: build object from form fields
    const formFields = args.resolvedConfig.formFields as unknown[];
    
    if (!Array.isArray(formFields) || formFields.length === 0) {
      return { output: {} };
    }

    const output: Record<string, unknown> = {};

    formFields.forEach((field) => {
      const typedField = field as FormField;
      const name = String(typedField.fieldName ?? "").trim();
      const type = String(typedField.fieldType ?? "string");
      const value = String(typedField.fieldValue ?? "");

      if (!name) return; // Skip empty field names

      // Convert value based on type
      switch (type) {
        case "number":
          output[name] = value ? parseFloat(value) : 0;
          break;
        case "boolean":
          output[name] = value.toLowerCase() === "true" || value === "1";
          break;
        case "array":
          try {
            const parsed = value ? JSON.parse(value) : [];
            output[name] = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // If parse fails, split by comma
            output[name] = value ? value.split(",").map((v) => v.trim()) : [];
          }
          break;
        case "object":
          try {
            const parsed = value ? JSON.parse(value) : {};
            output[name] = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
          } catch {
            output[name] = {}; // Fallback to empty object
          }
          break;
        case "string":
        default:
          output[name] = value;
          break;
      }
    });

    log.dataFlow('Manual node output (Form mode)', { ...context, output });
    return { output };
  }
}

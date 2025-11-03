import type { FieldDef } from "@node-playground/types";

const unicodeSamples = ["こんにちは", "😊", "ångström", "مرحبا", "नमस्ते", "¡Hola!", "ßeta"];
const longString = "A".repeat(256);
const bigNumber = 10 ** 12;
const negativeNumber = -9999;

export function generateFuzzValues(fields: FieldDef[], current: Record<string, unknown>): Record<string, unknown> {
  const cloned = { ...current };
  fields.forEach((field) => {
    cloned[field.key] = fuzzValue(field, current[field.key]);
  });
  return cloned;
}

function fuzzValue(field: FieldDef, currentValue: unknown): unknown {
  switch (field.type) {
    case "string":
    case "email":
    case "url":
      return pick([unicodeSamples, [longString, "", String(currentValue ?? ""), "{{steps.http1.body}}"]].flat());
    case "number":
      return pick([bigNumber, negativeNumber, 0, currentValue ?? 42]);
    case "boolean":
      return typeof currentValue === "boolean" ? !currentValue : true;
    case "enum":
      return field.enum?.[field.enum.length - 1];
    case "datetime":
      return new Date(Date.now() + 86400000).toISOString().slice(0, 16);
    case "object":
      if (field.widget === "keyValue" || field.widget === "keyValueWithType") {
        return [
          { key: "emoji", value: "😊" },
          { key: "long", value: longString },
          { key: "json", value: JSON.stringify({ nested: { value: "{{steps.setVariable1.value}}" } }) },
        ];
      }
      if (field.widget === "json-editor") {
        return JSON.stringify({ fuzz: unicodeSamples, long: longString }, null, 2);
      }
      return currentValue;
    case "array":
      return [unicodeSamples, ["{{steps.http1.body.email}}", longString]].flat();
    default:
      return currentValue;
  }
}

function pick<T>(options: T[]): T {
  return options[(Math.random() * options.length) | 0];
}

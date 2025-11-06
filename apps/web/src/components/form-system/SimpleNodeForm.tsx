import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import classNames from "classnames";
import type { NodeFormProps, NodeSchema, FieldDef } from "@node-playground/types";
import { Input, Select, Textarea, Checkbox, Button } from "../../design-system/primitives";
import { TokenizedInput } from "../../components/form-system/TokenizedInput";
import { KeyValueEditor } from "../../components/form-system/KeyValueEditor";

/**
 * SimpleNodeForm - Generic form for simple nodes
 * Handles basic field types: text, number, enum, boolean
 * Used by: Set, Wait, Limit, Sort, Code nodes
 */

// Build Zod schema from FieldDef[]
function buildZodSchema(fields: FieldDef[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "string":
      case "email":
      case "url":
        fieldSchema = z.string();
        if (field.min) fieldSchema = (fieldSchema as z.ZodString).min(field.min);
        if (field.max) fieldSchema = (fieldSchema as z.ZodString).max(field.max);
        break;
      case "number":
        fieldSchema = z.number().or(z.string().transform(Number));
        break;
      case "boolean":
        fieldSchema = z.boolean();
        break;
      case "enum":
        fieldSchema = z.enum((field.enum ?? [""]) as [string, ...string[]]);
        break;
      case "array":
        if (field.widget === "keyValue") {
          fieldSchema = z.array(z.object({ key: z.string(), value: z.string() }));
        } else {
          fieldSchema = z.array(z.any());
        }
        break;
      default:
        fieldSchema = z.any();
    }

    shape[field.key] = field.required ? fieldSchema : fieldSchema.optional();
  });

  return z.object(shape).passthrough();
}

export function SimpleNodeForm({ 
  schema, 
  value, 
  onChange, 
  onRun, 
  isRunning,
  stepOutputs = {} 
}: NodeFormProps): JSX.Element {
  const zodSchema = buildZodSchema(schema.inputs);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(value);
  }, [value, reset]);

  useEffect(() => {
    const subscription = watch((formValues) => {
      onChange(formValues as any);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const submitHandler = handleSubmit((formValues) => {
    onRun(formValues as any);
  });

  return (
    <form className="flex h-full flex-col" onSubmit={submitHandler}>
      {/* Form fields - No header, maximized space */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {schema.inputs.map((field) => (
            <Controller
              key={field.key}
              name={field.key as any}
              control={control}
              render={({ field: controllerField }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-ink-600">
                    {field.label || field.key}
                  </label>
                  
                  {renderField(field, controllerField, stepOutputs)}
                  
                  {field.help && (
                    <p className="text-xs text-ink-500">{field.help}</p>
                  )}
                  {errors[field.key] && (
                    <p className="text-xs text-rose-600">
                      {(errors[field.key] as any)?.message}
                    </p>
                  )}
                </div>
              )}
            />
          ))}
        </div>
      </div>

      {/* Auto-save indicator */}
      {isDirty && (
        <div className="border-t border-ink-200 bg-ink-50 px-4 py-2 text-xs text-ink-500">
          Changes are saved automatically.
        </div>
      )}
    </form>
  );
}

function renderField(
  field: FieldDef, 
  controllerField: any,
  stepOutputs: Record<string, unknown>
): JSX.Element {
  const { widget, type } = field;

  // Boolean checkbox
  if (type === "boolean") {
    return (
      <Checkbox
        {...controllerField}
        checked={Boolean(controllerField.value)}
        label={field.help}
      />
    );
  }

  // Enum select
  if (type === "enum") {
    return (
      <Select {...controllerField} value={String(controllerField.value ?? field.default ?? "")}>
        <option value="" disabled>Select option</option>
        {field.enum?.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </Select>
    );
  }

  // Textarea widgets
  if (widget === "textarea" || widget === "json-editor" || widget === "code") {
    return (
      <Textarea
        {...controllerField}
        value={String(controllerField.value ?? "")}
        rows={widget === "json-editor" || widget === "code" ? 8 : 3}
        className="font-mono"
      />
    );
  }

  // KeyValue widget
  if (widget === "keyValue") {
    return (
      <KeyValueEditor
        value={(controllerField.value as any) || []}
        onChange={controllerField.onChange}
        stepOutputs={stepOutputs}
      />
    );
  }

  // Number input
  if (type === "number") {
    return (
      <Input
        {...controllerField}
        type="text"
        value={controllerField.value === null || controllerField.value === undefined ? "" : String(controllerField.value)}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") {
            controllerField.onChange(undefined);
          } else if (val.includes("{{")) {
            controllerField.onChange(val);
          } else {
            const num = Number(val);
            controllerField.onChange(isNaN(num) ? val : num);
          }
        }}
      />
    );
  }

  // Default: TokenizedInput for string fields
  return (
    <TokenizedInput
      value={String(controllerField.value ?? "")}
      onChange={controllerField.onChange}
      onBlur={controllerField.onBlur}
      placeholder={field.placeholder || ""}
      stepOutputs={stepOutputs}
      className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none"
    />
  );
}

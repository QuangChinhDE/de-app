import { useEffect, useState, type ChangeEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import classNames from "classnames";
import { useDrop } from "react-dnd";
import type { NodeFormProps } from "@node-playground/types";
import { Textarea, Select, Button, Input } from "../../design-system/primitives";
import { DATA_FIELD_ITEM_TYPE, type DataFieldDragItem } from "../../components/DataFieldsPanel";

/**
 * ManualForm - STANDALONE form for MANUAL trigger node
 * Supports two modes:
 * - JSON: Raw JSON input
 * - Form: Field-based input with name, type, value
 */

interface ManualNodeConfig {
  mode: "json" | "form";
  jsonPayload?: string;
  formFields?: Array<{
    fieldName: string;
    fieldType: string;
    fieldValue: string;
  }>;
}

// Validation schema
const manualValidationSchema = z.object({
  mode: z.enum(["json", "form"]),
  jsonPayload: z.string().optional().refine((val) => {
    if (!val) return true;
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid JSON"),
  formFields: z.array(z.object({
    fieldName: z.string(),
    fieldType: z.string(),
    fieldValue: z.string(),
  })).optional(),
}).passthrough();

export function ManualForm({ 
  schema, 
  value, 
  onChange, 
  onRun, 
  isRunning,
}: NodeFormProps<ManualNodeConfig>): JSX.Element {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ManualNodeConfig>({
    resolver: zodResolver(manualValidationSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const mode = watch("mode");

  useEffect(() => {
    reset(value);
  }, [value, reset]);

  useEffect(() => {
    const subscription = watch((formValues) => {
      onChange(formValues as ManualNodeConfig);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const submitHandler = handleSubmit((formValues) => {
    onRun(formValues);
  });

  return (
    <form className="flex h-full flex-col" onSubmit={submitHandler}>
      {/* Header with Run button */}
      <div className="flex items-center gap-2 border-b border-ink-200 px-4 py-2">
        <div className="text-sm font-semibold text-ink-700">Manual Trigger Configuration</div>
        
        <div className="ml-auto">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run test"}
          </Button>
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {/* Mode Selector */}
          <Controller
            name="mode"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-ink-600">Input Mode</label>
                <Select {...field}>
                  <option value="json">JSON</option>
                  <option value="form">Form</option>
                </Select>
                <p className="text-xs text-ink-500">
                  JSON: Enter raw JSON | Form: Define fields with name, type, and value
                </p>
              </div>
            )}
          />

          {/* Conditional Fields based on mode */}
          {mode === "json" && (
            <Controller
              name="jsonPayload"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-ink-600">JSON Payload</label>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    rows={12}
                    placeholder={'{\n  "key": "value"\n}'}
                    className="font-mono"
                  />
                  <p className="text-xs text-ink-500">
                    JSON mode: Enter test data in JSON format
                  </p>
                  {errors.jsonPayload && (
                    <p className="text-xs text-rose-600">{errors.jsonPayload.message}</p>
                  )}
                </div>
              )}
            />
          )}

          {mode === "form" && (
            <Controller
              name="formFields"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-ink-600">Form Fields</label>
                  <FormFieldsEditor
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                  <p className="text-xs text-ink-500">
                    Form mode: Define fields with name, type, and value
                  </p>
                </div>
              )}
            />
          )}
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

// FormFieldsEditor component - COPIED from SchemaForm.tsx
interface FormFieldRow {
  fieldName: string;
  fieldType: string;
  fieldValue: string;
}

interface FormFieldsEditorProps {
  value: FormFieldRow[];
  onChange: (value: FormFieldRow[]) => void;
}

function FormFieldsEditor({ value, onChange }: FormFieldsEditorProps): JSX.Element {
  const rows = value.length ? value : [{ fieldName: "", fieldType: "string", fieldValue: "" }];
  const fieldTypes = [
    { value: "string", label: "String", icon: "ab" },
    { value: "number", label: "Number", icon: "#" },
    { value: "boolean", label: "Boolean", icon: "☑" },
    { value: "array", label: "Array", icon: "≡" },
    { value: "object", label: "Object", icon: "◇" },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-ink-600 px-2">
        <div className="col-span-4">Field Name</div>
        <div className="col-span-3">Type</div>
        <div className="col-span-4">Value</div>
        <div className="col-span-1"></div>
      </div>
      {rows.map((row, index) => (
        <FormFieldRow
          key={index}
          row={row}
          index={index}
          rows={rows}
          onChange={onChange}
          fieldTypes={fieldTypes}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { fieldName: "", fieldType: "string", fieldValue: "" }])}
        className="w-full rounded-md border-2 border-dashed border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50"
      >
        + Add Field
      </button>
      <p className="text-xs text-ink-500">
        Define output fields: name (key), type (string/number/boolean/array/object), and value
      </p>
    </div>
  );
}

// FormFieldRow component
interface FormFieldRowProps {
  row: { fieldName: string; fieldType: string; fieldValue: string };
  index: number;
  rows: Array<{ fieldName: string; fieldType: string; fieldValue: string }>;
  onChange: (rows: Array<{ fieldName: string; fieldType: string; fieldValue: string }>) => void;
  fieldTypes: Array<{ value: string; label: string; icon: string }>;
}

function FormFieldRow({ row, index, rows, onChange, fieldTypes }: FormFieldRowProps): JSX.Element {
  const [{ isOver }, dropRef] = useDrop<DataFieldDragItem, void, { isOver: boolean }>(() => ({
    accept: DATA_FIELD_ITEM_TYPE,
    drop: (item: DataFieldDragItem) => {
      const updated = [...rows];
      updated[index] = { ...updated[index], fieldValue: item.token };
      onChange(updated);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [rows, onChange, index]);

  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <Input
        type="text"
        value={row.fieldName}
        placeholder="e.g., userId, name"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const updated = [...rows];
          updated[index] = { ...updated[index], fieldName: event.target.value };
          onChange(updated);
        }}
        className="col-span-4"
      />
      <Select
        value={row.fieldType}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const updated = [...rows];
          updated[index] = { ...updated[index], fieldType: event.target.value };
          onChange(updated);
        }}
        className="col-span-3"
        title="Field Type"
      >
        {fieldTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.icon} {type.label}
          </option>
        ))}
      </Select>
      <div
        ref={dropRef}
        className={`col-span-4 relative transition-all ${
          isOver 
            ? "ring-4 ring-indigo-400 rounded-lg bg-indigo-50 p-1" 
            : "hover:ring-2 hover:ring-indigo-200 rounded-lg"
        }`}
      >
        {isOver && (
          <div className="absolute -top-8 left-0 right-0 z-10 flex items-center justify-center">
            <span className="rounded-full bg-indigo-500 px-2 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
              ⬇️ DROP
            </span>
          </div>
        )}
        <Input
          type="text"
          value={row.fieldValue}
          placeholder={
            row.fieldType === "array" ? '["item1", "item2"]' :
            row.fieldType === "object" ? '{"key": "val"}' :
            row.fieldType === "boolean" ? "true / false" :
            row.fieldType === "number" ? "123" :
            "value or drag token"
          }
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const updated = [...rows];
            updated[index] = { ...updated[index], fieldValue: event.target.value };
            onChange(updated);
          }}
          fullWidth={true}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          const updated = rows.filter((_, i) => i !== index);
          onChange(updated.length ? updated : [{ fieldName: "", fieldType: "string", fieldValue: "" }]);
        }}
        className="col-span-1 text-rose-500 hover:text-rose-600 text-lg"
        title="Remove field"
      >
        ✕
      </button>
    </div>
  );
}

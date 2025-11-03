import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  type FieldDef,
  type NodeSchema,
} from "@node-playground/types";
import { useForm, Controller, type Control, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import classNames from "classnames";
import { useDrop } from "react-dnd";
import { DATA_FIELD_ITEM_TYPE, type DataFieldDragItem } from "./DataFieldsPanel";

type TabKey = NonNullable<FieldDef["group"]>;

const TAB_ORDER: TabKey[] = ["inputs", "auth", "advanced", "validation"];

export interface SchemaFormProps {
  schema: NodeSchema;
  initialValues: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  onRun: (values: Record<string, unknown>) => void;
  isRunning?: boolean;
  onFuzz?: (current: Record<string, unknown>) => Record<string, unknown>;
  stepOutputs?: Record<string, unknown>;
}

export function SchemaForm({ schema, initialValues, onChange, onRun, isRunning, onFuzz, stepOutputs = {} }: SchemaFormProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>("inputs");
  const zodSchema = useMemo(() => buildSchema(schema.inputs), [schema.inputs]);
  const groupedFields = useMemo(() => groupFields(schema.inputs), [schema.inputs]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(zodSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  // Watch mode value for conditional field visibility (IF node)
  const currentMode = watch("mode");
  
  // Watch bodyMode for HTTP node conditional fields
  const currentBodyMode = watch("bodyMode");

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset, schema.key]);

  useEffect(() => {
    if (
      !schema.inputs.some((field: FieldDef) => field.group === activeTab) &&
      groupedFields.inputs.length
    ) {
      setActiveTab("inputs");
    }
  }, [activeTab, schema.inputs, groupedFields.inputs.length]);

  useEffect(() => {
    const subscription = watch((values: Record<string, unknown>) => {
      onChange(values);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const submitHandler = handleSubmit((values: Record<string, unknown>) => {
    onRun(values);
  });

  const handleFuzz = () => {
    if (!onFuzz) {
      return;
    }
    const fuzzed = onFuzz(watch() as Record<string, unknown>);
    reset(fuzzed);
    onChange(fuzzed);
  };

  const availableTabs = TAB_ORDER.filter((tab) => groupedFields[tab]?.length);

  return (
    <form className="flex h-full flex-col" onSubmit={submitHandler}>
      <div className="flex items-center gap-2 border-b border-ink-200 px-4 py-2">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={classNames(
              "rounded-md px-3 py-1 text-sm font-medium",
              activeTab === tab
                ? "bg-indigo-500 text-white"
                : "text-ink-500 hover:bg-ink-100 hover:text-ink-700"
            )}
          >
            {tabLabel(tab)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {onFuzz && (
            <button
              type="button"
              onClick={handleFuzz}
              className="rounded-md border border-ink-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-500 hover:bg-ink-100"
            >
              Fuzz inputs
            </button>
          )}
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-ink-300"
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run test"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {availableTabs.map((tab) => (
          <div key={tab} className={classNames({ hidden: activeTab !== tab })}>
            <div className="space-y-4">
              {groupedFields[tab]?.map((field: FieldDef) => {
                // Conditional visibility for IF/SWITCH/MANUAL/HTTP nodes
                if (shouldHideField(field, currentMode as string, currentBodyMode as string)) {
                  return null;
                }
                return (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    control={control}
                    error={errors[field.key]?.message as string | undefined}
                    stepOutputs={stepOutputs}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {!availableTabs.length && (
          <p className="text-sm text-ink-500">No configurable inputs for this node.</p>
        )}
      </div>

      {isDirty && (
        <div className="border-t border-ink-200 bg-ink-50 px-4 py-2 text-xs text-ink-500">
          Changes are saved automatically.
        </div>
      )}
    </form>
  );
}

interface FieldRendererProps {
  field: FieldDef;
  control: Control<Record<string, unknown>>;
  error?: string;
  key?: string;
  stepOutputs: Record<string, unknown>;
}

function FieldRenderer({ field, control, error, stepOutputs }: FieldRendererProps): JSX.Element {
  return (
    <Controller
      name={field.key as never}
      control={control}
      render={({ field: controllerField }: { field: ControllerRenderProps<Record<string, unknown>> }) => (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-ink-600" htmlFor={field.key}>
            {field.label ?? field.key}
          </label>
          <InputByType field={field} controllerField={controllerField} stepOutputs={stepOutputs} />
          {field.help && <p className="text-xs text-ink-500">{field.help}</p>}
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      )}
    />
  );
}

// Helper: Extract tokens from string
function extractTokens(value: string): Array<{ token: string; path: string }> {
  const regex = /{{([^}]+)}}/g;
  const matches: Array<{ token: string; path: string }> = [];
  let match;
  while ((match = regex.exec(value)) !== null) {
    matches.push({ token: match[0], path: match[1] });
  }
  return matches;
}

// Helper: Get preview value for a token path
function getPreviewValue(path: string, stepOutputs: Record<string, unknown>): unknown {
  // Token path format: steps.nodeName.field or nodeName.field
  // stepOutputs format: { nodeName: { field: value } }
  
  // Remove "steps." prefix if exists
  const cleanPath = path.startsWith('steps.') ? path.slice(6) : path;
  const parts = cleanPath.split('.');
  let current: any = stepOutputs;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}

// TokenPreview: Shows token tags with value preview
interface TokenPreviewProps {
  tokens: Array<{ token: string; path: string }>;
  stepOutputs: Record<string, unknown>;
}

function TokenPreview({ tokens, stepOutputs }: TokenPreviewProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
      {tokens.map((item, index) => {
        const previewValue = getPreviewValue(item.path, stepOutputs);
        const hasPreview = previewValue !== undefined;
        
        return (
          <div key={index} className="flex flex-col gap-1">
            {/* Token tag */}
            <div className="inline-flex items-center gap-1 self-start rounded-full bg-indigo-500 px-3 py-1 text-xs font-mono font-bold text-white shadow-sm">
              <span>🏷️</span>
              <span>{item.token}</span>
            </div>
            
            {/* Preview value */}
            {hasPreview && (
              <div className="ml-2 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1">
                <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Preview:</div>
                <div className="mt-0.5 max-h-32 overflow-auto font-mono text-xs text-emerald-900">
                  {typeof previewValue === 'object' 
                    ? JSON.stringify(previewValue, null, 2)
                    : String(previewValue)
                  }
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// TokenizedInput: Renders tokens as inline chips (like Zapier)
interface TokenizedInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  stepOutputs: Record<string, unknown>;
  className?: string;
}

function TokenizedInput({ value, onChange, onBlur, placeholder, stepOutputs, className }: TokenizedInputProps): JSX.Element {
  // Create own drop handler (like n8n/Zapier - each input manages its own drop)
  const [{ isOver }, dropRef] = useDrop<DataFieldDragItem, void, { isOver: boolean }>(() => ({
    accept: DATA_FIELD_ITEM_TYPE,
    drop: (item: DataFieldDragItem) => {
      // Append token to existing value
      const currentValue = value || "";
      const newValue = currentValue.length > 0 ? `${currentValue} ${item.token}` : item.token;
      onChange(newValue);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver() && !monitor.didDrop(),
    }),
  }), [value, onChange]);
  // Parse value into parts: text and tokens
  const parts = useMemo(() => {
    const result: Array<{ type: 'text' | 'token'; content: string; path?: string }> = [];
    const regex = /{{([^}]+)}}/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(value)) !== null) {
      // Add text before token
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: value.substring(lastIndex, match.index) });
      }
      // Add token
      result.push({ type: 'token', content: match[0], path: match[1] });
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < value.length) {
      result.push({ type: 'text', content: value.substring(lastIndex) });
    }
    
    return result;
  }, [value]);

  const [isEditing, setIsEditing] = useState(false);
  const hasTokens = parts.some((p) => p.type === 'token');

  // Remove a token
  const removeToken = (tokenToRemove: string) => {
    const newValue = value.replace(tokenToRemove, '');
    onChange(newValue);
  };

  return (
    <div ref={dropRef} className="flex flex-col gap-2">
      {/* Visual display with chips (when not editing) */}
      {!isEditing && hasTokens ? (
        <div
          className={`flex min-h-[42px] flex-wrap items-center gap-1 rounded-md border px-3 py-2 transition-all ${
            isOver 
              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300" 
              : "border-ink-200 bg-white"
          }`}
        >
          {parts.map((part, index) => {
            if (part.type === 'token') {
              const previewValue = part.path ? getPreviewValue(part.path, stepOutputs) : undefined;
              return (
                <div
                  key={index}
                  className="group relative inline-flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-mono text-white shadow-sm"
                  title={part.content} // Fallback tooltip
                >
                  <span className="select-none font-bold">{part.content}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeToken(part.content);
                    }}
                    className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
                    title="Remove token"
                  >
                    ✕
                  </button>
                  {/* Tooltip with preview - always show on hover */}
                  <div className="pointer-events-none absolute bottom-full left-0 z-[999] mb-2 hidden w-max max-w-sm rounded-lg border-2 border-emerald-400 bg-emerald-50 p-3 shadow-xl group-hover:block">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Preview Value:</div>
                    <div className="max-h-48 overflow-auto rounded border border-emerald-200 bg-white p-2 font-mono text-xs text-emerald-900">
                      {previewValue !== undefined 
                        ? (typeof previewValue === 'object'
                            ? JSON.stringify(previewValue, null, 2)
                            : String(previewValue))
                        : (
                          <div className="space-y-1">
                            <span className="block italic text-red-600">⚠️ No data available</span>
                            <div className="text-[9px] text-gray-500">
                              <div>Token: {part.content}</div>
                              <div>Path: {part.path}</div>
                              <div>Outputs: {JSON.stringify(Object.keys(stepOutputs))}</div>
                            </div>
                          </div>
                        )
                      }
                    </div>
                  </div>
                </div>
              );
            } else {
              // Plain text - make it clickable to edit
              return (
                <span 
                  key={index} 
                  className="cursor-text text-sm text-ink-700"
                  onClick={() => setIsEditing(true)}
                >
                  {part.content}
                </span>
              );
            }
          })}
          {parts.length === 0 && (
            <span className="text-sm text-ink-400">{placeholder}</span>
          )}
          
          {/* Edit button */}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="ml-auto flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-200"
            title="Edit raw value"
          >
            ✏️ Edit
          </button>
        </div>
      ) : (
        /* Editable input (when editing or no tokens) */
        <div className="relative">
          {isOver && (
            <div className="absolute -top-8 left-0 right-0 z-10 flex items-center justify-center">
              <span className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
                ⬇️ DROP HERE
              </span>
            </div>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              onBlur();
            }}
            onFocus={() => setIsEditing(true)}
            placeholder={placeholder}
            className={className}
            autoFocus={isEditing}
          />
        </div>
      )}
      
      {/* Help text */}
      {hasTokens && !isEditing && (
        <div className="text-[10px] text-ink-500">
          💡 Hover chip for preview • Click "Edit" to modify
        </div>
      )}
    </div>
  );
}

interface InputByTypeProps {
  field: FieldDef;
  controllerField: ControllerRenderProps<Record<string, unknown>>;
  stepOutputs: Record<string, unknown>;
}

function InputByType({ field, controllerField, stepOutputs }: InputByTypeProps): JSX.Element {
  const commonProps = {
    id: field.key,
    name: field.key,
    onBlur: controllerField.onBlur,
  };
  const placeholder = field.placeholder ?? "";
  const supportsToken = supportsTokenDrop(field);

  const [{ isOver }, dropRef] = useTokenDrop((token) => {
    if (!supportsToken) {
      return;
    }
    if (field.widget === "chips") {
      const current = Array.isArray(controllerField.value)
        ? (controllerField.value as string[])
        : [];
      
      // For chips widget, always add the full token
      // This shows users exactly what they're referencing: {{steps.manual1.name}}
      // Runtime will handle extraction if needed (e.g., SPLIT node extracts field names)
      controllerField.onChange([...current, token]);
      return;
    }
    const next = (() => {
      const currentValue = controllerField.value;
      if (typeof currentValue === "string") {
        return currentValue.length ? `${currentValue} ${token}` : token;
      }
      if (currentValue === null || typeof currentValue === "undefined") {
        return token;
      }
      try {
        return `${String(currentValue)} ${token}`;
      } catch {
        return token;
      }
    })();
    controllerField.onChange(next);
  });

  const wrapIfDroppable = (element: JSX.Element): JSX.Element =>
    supportsToken ? (
      <div 
        ref={dropRef} 
        className={`group relative transition-all ${
          isOver 
            ? "ring-4 ring-indigo-400 rounded-lg bg-indigo-50 p-1 shadow-lg" 
            : "hover:ring-2 hover:ring-indigo-200 rounded-lg"
        }`}
      >
        {isOver && (
          <div className="absolute -top-8 left-0 right-0 z-10 flex items-center justify-center">
            <span className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
              ⬇️ DROP HERE
            </span>
          </div>
        )}
        {!isOver && (
          <div className="absolute -top-6 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="rounded bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              ✓ Drop zone
            </span>
          </div>
        )}
        {element}
      </div>
    ) : (
      element
    );

  switch (field.type) {
    case "number":
      return wrapIfDroppable(
        <input
          {...commonProps}
          type="text"
          min={field.min}
          max={field.max}
          value={
            controllerField.value === null || typeof controllerField.value === "undefined"
              ? ""
              : String(controllerField.value)
          }
          placeholder={placeholder}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.value === "") {
              controllerField.onChange(undefined);
              return;
            }
            // If value looks like a token, keep as string
            if (event.target.value.includes("{{")) {
              controllerField.onChange(event.target.value);
              return;
            }
            // Otherwise convert to number
            const num = Number(event.target.value);
            controllerField.onChange(isNaN(num) ? event.target.value : num);
          }}
          className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none"
        />
      );
    case "boolean":
      return wrapIfDroppable(
        <label className="inline-flex items-center gap-2 text-sm text-ink-600">
          <input
            {...commonProps}
            type="checkbox"
            checked={Boolean(controllerField.value)}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              controllerField.onChange(event.target.checked)
            }
            className="h-4 w-4 rounded border-ink-300 text-indigo-600"
          />
          <span>{field.help ?? "Enable"}</span>
        </label>
      );
    case "enum":
      return wrapIfDroppable(
        <select
          {...commonProps}
          value={String(controllerField.value ?? field.default ?? "")}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            controllerField.onChange(event.target.value)
          }
          className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none"
        >
          <option value="" disabled>
            Select option
          </option>
          {field.enum?.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    default:
      return renderByWidget(field, controllerField, placeholder, commonProps, wrapIfDroppable, stepOutputs, dropRef, isOver);
  }
}

function renderByWidget(
  field: FieldDef,
  controllerField: InputByTypeProps["controllerField"],
  placeholder: string,
  commonProps: Record<string, unknown>,
  wrapIfDroppable: (element: JSX.Element) => JSX.Element,
  stepOutputs: Record<string, unknown>,
  dropRef: any,
  isOver: boolean
): JSX.Element {
  const widget = field.widget ?? "text";

  if (widget === "textarea" || widget === "json-editor" || widget === "code") {
    const textareaElement = (
      <textarea
        {...commonProps}
        value={String(controllerField.value ?? "")}
        placeholder={placeholder}
        rows={widget === "json-editor" || widget === "code" ? 8 : 3}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
          controllerField.onChange(event.target.value)
        }
        className="w-full rounded-md border border-ink-200 px-3 py-2 font-mono text-sm shadow-sm focus:border-indigo-400 focus:outline-none"
      />
    );
    
    // Show token preview below textarea
    const tokens = extractTokens(String(controllerField.value ?? ""));
    const hasTokens = tokens.length > 0;
    
    return wrapIfDroppable(
      <div className="flex flex-col gap-2">
        {textareaElement}
        {hasTokens && (
          <TokenPreview tokens={tokens} stepOutputs={stepOutputs} />
        )}
      </div>
    );
  }

  if (widget === "keyValue" || widget === "keyValueWithType") {
    return (
      <KeyValueEditor
        value={(controllerField.value as KeyValueRow[]) ?? []}
        onChange={controllerField.onChange}
        allowType={widget === "keyValueWithType"}
        stepOutputs={stepOutputs}
      />
    );
  }

  if (widget === "chips") {
    return wrapIfDroppable(
      <ChipsEditor value={(controllerField.value as string[]) ?? []} onChange={controllerField.onChange} />
    );
  }

  // Special handling for conditions array - detect node type
  // Column Editor for SET node
  if (field.key === "columns" && field.type === "array") {
    return (
      <ColumnEditor
        value={(controllerField.value as ColumnTransformRow[]) ?? []}
        onChange={controllerField.onChange}
        stepOutputs={stepOutputs}
      />
    );
  }

  if (field.key === "conditions" && field.type === "array") {
    // Both IF and FILTER nodes now use FilterConditionsEditor (filter structure)
    // Old IF node with leftValue/rightValue structure is deprecated
    return (
      <FilterConditionsEditor
        value={(controllerField.value as FilterConditionRow[]) ?? []}
        onChange={controllerField.onChange}
        stepOutputs={stepOutputs}
      />
    );
  }

  // Special handling for SWITCH node cases
  if (field.key === "cases" && field.type === "array") {
    return (
      <CasesEditor
        value={(controllerField.value as string[]) ?? []}
        onChange={controllerField.onChange}
        stepOutputs={stepOutputs}
      />
    );
  }

  // Special handling for MANUAL node form fields
  if (field.key === "formFields" && field.type === "array") {
    return (
      <FormFieldsEditor
        value={(controllerField.value as FormFieldRow[]) ?? []}
        onChange={controllerField.onChange}
        stepOutputs={stepOutputs}
      />
    );
  }

  if (field.type === "datetime") {
    return wrapIfDroppable(
      <input
        {...commonProps}
        type="datetime-local"
        value={String(controllerField.value ?? "")}
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          controllerField.onChange(event.target.value)
        }
        className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none"
      />
    );
  }

  // Use TokenizedInput for text fields (shows tokens as tags + preview)
  return (
    <TokenizedInput
      value={String(controllerField.value ?? "")}
      onChange={controllerField.onChange}
      onBlur={controllerField.onBlur}
      placeholder={placeholder}
      stepOutputs={stepOutputs}
      className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none"
    />
  );
}

type KeyValueRow = {
  key: string;
  value: string;
  sensitive?: boolean;
  type?: string;
};

interface KeyValueEditorProps {
  value: KeyValueRow[];
  onChange: (value: KeyValueRow[]) => void;
  allowType?: boolean;
  stepOutputs?: Record<string, unknown>;
}

// Separate component for each row to avoid hooks in loop
interface KeyValueRowProps {
  row: { key: string; value: string; type?: string; sensitive?: boolean };
  index: number;
  rows: Array<{ key: string; value: string; type?: string; sensitive?: boolean }>;
  onChange: (rows: Array<{ key: string; value: string; type?: string; sensitive?: boolean }>) => void;
  allowType?: boolean;
  stepOutputs: Record<string, unknown>;
}

function KeyValueRow({ row, index, rows, onChange, allowType, stepOutputs }: KeyValueRowProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-ink-200 bg-white p-3">
      {/* Row 1: Key + Type + Actions */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Field (drag token)
          </label>
          <input
            type="text"
            value={row.key}
            placeholder="Key"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const updated = [...rows];
              updated[index] = { ...updated[index], key: event.target.value };
              onChange(updated);
            }}
            className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
        
        {allowType && (
          <div className="w-32">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-500">
              Type
            </label>
            <select
              value={row.type ?? "string"}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                const updated = [...rows];
                updated[index] = { ...updated[index], type: event.target.value };
                onChange(updated);
              }}
              className="w-full rounded-md border border-ink-200 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none"
              title="Field Type"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>
        )}
        
        <label className="flex items-center gap-1 self-end pb-1 text-xs text-ink-500">
          <input
            type="checkbox"
            checked={Boolean(row.sensitive)}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const updated = [...rows];
              updated[index] = { ...updated[index], sensitive: event.target.checked };
              onChange(updated);
            }}
            className="h-3 w-3"
          />
          mask
        </label>
      </div>

      {/* Row 2: Value field (full width) */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-500">
          Value
        </label>
        <TokenizedInput
          value={row.value}
          onChange={(newValue) => {
            const updated = [...rows];
            updated[index] = { ...updated[index], value: newValue };
            onChange(updated);
          }}
          onBlur={() => {}}
          placeholder="Value or drag token"
          stepOutputs={stepOutputs}
          className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm"
        />
      </div>

      {/* Remove button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            const updated = rows.filter((_, i) => i !== index);
            onChange(updated.length ? updated : [{ key: "", value: "" }]);
          }}
          className="rounded-md bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-100"
        >
          ✕ Remove
        </button>
      </div>
    </div>
  );
}

function KeyValueEditor({ value, onChange, allowType, stepOutputs = {} }: KeyValueEditorProps): JSX.Element {
  const rows = value.length ? value : [{ key: "", value: "" }];

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <KeyValueRow
          key={index}
          row={row}
          index={index}
          rows={rows}
          onChange={onChange}
          allowType={allowType}
          stepOutputs={stepOutputs}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { key: "", value: "" }])}
        className="rounded-md border border-dashed border-ink-300 px-2 py-1 text-xs text-ink-500 hover:border-ink-400"
      >
        + add row
      </button>
    </div>
  );
}

interface ConditionRow {
  leftValue: string;
  operator: string;
  rightValue?: string;
}

interface FilterConditionRow {
  field: string;
  fieldType: string;
  operator: string;
  value: string;
}

interface ConditionsEditorProps {
  value: ConditionRow[];
  onChange: (value: ConditionRow[]) => void;
  stepOutputs?: Record<string, unknown>;
}

interface FilterConditionsEditorProps {
  value: FilterConditionRow[];
  onChange: (value: FilterConditionRow[]) => void;
  stepOutputs?: Record<string, unknown>;
}

interface ColumnTransformRow {
  sourceField: string;
  targetField: string;
  targetType: string;
  transformExpression?: string;
}

interface ColumnEditorProps {
  value: ColumnTransformRow[];
  onChange: (value: ColumnTransformRow[]) => void;
  stepOutputs?: Record<string, unknown>;
}

// Separate component for each condition row
interface ConditionRowComponentProps {
  row: ConditionRow;
  index: number;
  rows: ConditionRow[];
  onChange: (rows: ConditionRow[]) => void;
  operators: string[];
  stepOutputs: Record<string, unknown>;
}

function ConditionRowComponent({ row, index, rows, onChange, operators, stepOutputs }: ConditionRowComponentProps): JSX.Element {

  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <TokenizedInput
          value={row.leftValue}
          onChange={(newValue) => {
            const updated = [...rows];
            updated[index] = { ...updated[index], leftValue: newValue };
            onChange(updated);
          }}
          onBlur={() => {}}
          placeholder="Left value (drag token or type)"
          stepOutputs={stepOutputs}
          className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm"
        />
      </div>
      <select
        value={row.operator}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const updated = [...rows];
          updated[index] = { ...updated[index], operator: event.target.value };
          onChange(updated);
        }}
        className="w-32 rounded-md border border-ink-200 px-2 py-1 text-sm"
        title="Operator"
      >
        {operators.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      <div className="flex-1">
        <TokenizedInput
          value={row.rightValue ?? ""}
          onChange={(newValue) => {
            const updated = [...rows];
            updated[index] = { ...updated[index], rightValue: newValue };
            onChange(updated);
          }}
          onBlur={() => {}}
          placeholder="Right value (drag token or type)"
          stepOutputs={stepOutputs}
          className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => {
          const updated = rows.filter((_, i) => i !== index);
          onChange(updated.length ? updated : [{ leftValue: "", operator: "==", rightValue: "" }]);
        }}
        className="text-xs font-semibold uppercase tracking-wide text-rose-500 hover:text-rose-600"
      >
        remove
      </button>
    </div>
  );
}

function ConditionsEditor({ value, onChange, stepOutputs = {} }: ConditionsEditorProps): JSX.Element {
  const rows = value.length ? value : [{ leftValue: "", operator: "==", rightValue: "" }];
  const operators = ["==", "!=", ">", "<", ">=", "<=", "contains", "startsWith", "endsWith", "isEmpty", "isNotEmpty"];

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <ConditionRowComponent
          key={index}
          row={row}
          index={index}
          rows={rows}
          onChange={onChange}
          operators={operators}
          stepOutputs={stepOutputs}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { leftValue: "", operator: "==", rightValue: "" }])}
        className="rounded-md border border-dashed border-ink-300 px-2 py-1 text-xs text-ink-500 hover:border-ink-400"
      >
        + add condition
      </button>
    </div>
  );
}

interface FormFieldRow {
  fieldName: string;
  fieldType: string;
  fieldValue: string;
}

interface FormFieldsEditorProps {
  value: FormFieldRow[];
  onChange: (value: FormFieldRow[]) => void;
  stepOutputs?: Record<string, unknown>;
}

// Separate component for form field row
interface FormFieldRowProps {
  row: { fieldName: string; fieldType: string; fieldValue: string };
  index: number;
  rows: Array<{ fieldName: string; fieldType: string; fieldValue: string }>;
  onChange: (rows: Array<{ fieldName: string; fieldType: string; fieldValue: string }>) => void;
  fieldTypes: Array<{ value: string; label: string; icon: string }>;
}

function FormFieldRow({ row, index, rows, onChange, fieldTypes }: FormFieldRowProps): JSX.Element {
  const [{ isOver }, dropRef] = useTokenDrop((token) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], fieldValue: token };
    onChange(updated);
  });

  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <input
        type="text"
        value={row.fieldName}
        placeholder="e.g., userId, name"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const updated = [...rows];
          updated[index] = { ...updated[index], fieldName: event.target.value };
          onChange(updated);
        }}
        className="col-span-4 rounded-md border border-ink-200 px-2 py-2 text-sm focus:border-indigo-400"
      />
      <select
        value={row.fieldType}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const updated = [...rows];
          updated[index] = { ...updated[index], fieldType: event.target.value };
          onChange(updated);
        }}
        className="col-span-3 rounded-md border border-ink-200 px-2 py-2 text-sm focus:border-indigo-400"
        title="Field Type"
      >
        {fieldTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.icon} {type.label}
          </option>
        ))}
      </select>
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
        <input
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
          className="w-full rounded-md border border-ink-200 px-2 py-2 text-sm focus:border-indigo-400"
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

interface CasesEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  stepOutputs?: Record<string, unknown>;
}

// Separate component for each case input
interface CaseInputProps {
  caseValue: string;
  index: number;
  cases: string[];
  onChange: (cases: string[]) => void;
}

function CaseInput({ caseValue, index, cases, onChange }: CaseInputProps): JSX.Element {
  const [{ isOver }, dropRef] = useTokenDrop((token) => {
    const updated = [...cases];
    updated[index] = token;
    onChange(updated);
  });

  return (
    <div className="flex gap-2 items-center">
      <div
        ref={dropRef}
        className={`flex-1 relative transition-all ${
          isOver 
            ? "ring-4 ring-indigo-400 rounded-lg bg-indigo-50 p-1" 
            : "hover:ring-2 hover:ring-indigo-200 rounded-lg"
        }`}
      >
        {isOver && (
          <div className="absolute -top-8 left-0 right-0 z-10 flex items-center justify-center">
            <span className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
              ⬇️ DROP HERE
            </span>
          </div>
        )}
        <input
          type="text"
          value={String(caseValue)}
          placeholder={`Case ${index + 1} value (e.g., 200, success) or drag token`}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const updated = [...cases];
            updated[index] = event.target.value;
            onChange(updated);
          }}
          className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400"
        />
      </div>
      <button
        type="button"
        onClick={() => {
          const updated = cases.filter((_, i) => i !== index);
          onChange(updated.length ? updated : [""]);
        }}
        className="rounded-md bg-rose-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 hover:bg-rose-200"
      >
        Remove
      </button>
    </div>
  );
}

function CasesEditor({ value, onChange }: CasesEditorProps): JSX.Element {
  const cases = value.length ? value : [""];

  return (
    <div className="space-y-2">
      {cases.map((caseValue, index) => (
        <CaseInput
          key={index}
          caseValue={caseValue}
          index={index}
          cases={cases}
          onChange={onChange}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...cases, ""])}
        className="w-full rounded-md border-2 border-dashed border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50"
      >
        + Add Case
      </button>
      <p className="text-xs text-ink-500">
        Each case creates an output handle. Drag tokens from DATA panel or type values manually.
      </p>
    </div>
  );
}

function FilterConditionsEditor({ value, onChange, stepOutputs = {} }: FilterConditionsEditorProps): JSX.Element {
  // Ensure we have proper filter structure - if empty or invalid, create default
  let rows = value;
  if (!Array.isArray(rows) || rows.length === 0) {
    rows = [{ field: "", fieldType: "", operator: "", value: "" }];
  }
  
  // Fix any rows that might be missing required fields
  rows = rows.map(row => ({
    field: row.field || "",
    fieldType: row.fieldType || "", 
    operator: row.operator || "",
    value: row.value || ""
  }));

  const fieldTypes = [
    { value: "", label: "-- Select Type --" },
    { value: "string", label: "String" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "date", label: "Date & Time" },
    { value: "array", label: "Array" },
    { value: "object", label: "Object" },
  ];

  const getOperatorsByType = (fieldType: string): { value: string; label: string }[] => {
    // Return empty array if no type selected
    if (!fieldType) {
      return [];
    }
    
    switch (fieldType) {
      case "string":
        return [
          { value: "is equal to", label: "is equal to" },
          { value: "is not equal to", label: "is not equal to" },
          { value: "contains", label: "contains" },
          { value: "does not contain", label: "does not contain" },
          { value: "starts with", label: "starts with" },
          { value: "does not start with", label: "does not start with" },
          { value: "ends with", label: "ends with" },
          { value: "does not end with", label: "does not end with" },
          { value: "matches regex", label: "matches regex" },
          { value: "does not match regex", label: "does not match regex" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
        ];
      case "number":
        return [
          { value: "is equal to", label: "is equal to" },
          { value: "is not equal to", label: "is not equal to" },
          { value: "is greater than", label: "is greater than" },
          { value: "is less than", label: "is less than" },
          { value: "is greater than or equal to", label: "is greater than or equal to" },
          { value: "is less than or equal to", label: "is less than or equal to" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
        ];
      case "boolean":
        return [
          { value: "is true", label: "is true" },
          { value: "is false", label: "is false" },
          { value: "is equal to", label: "is equal to" },
          { value: "is not equal to", label: "is not equal to" },
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
        ];
      case "date":
        return [
          { value: "is equal to", label: "is equal to" },
          { value: "is not equal to", label: "is not equal to" },
          { value: "is after", label: "is after" },
          { value: "is before", label: "is before" },
          { value: "is after or equal to", label: "is after or equal to" },
          { value: "is before or equal to", label: "is before or equal to" },
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
        ];
      case "array":
        return [
          { value: "contains", label: "contains" },
          { value: "does not contain", label: "does not contain" },
          { value: "length equal to", label: "length equal to" },
          { value: "length not equal to", label: "length not equal to" },
          { value: "length greater than", label: "length greater than" },
          { value: "length less than", label: "length less than" },
          { value: "length greater than or equal to", label: "length greater than or equal to" },
          { value: "length less than or equal to", label: "length less than or equal to" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
        ];
      default:
        return [
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
        ];
    }
  };

  // Check if operator needs value input
  const operatorNeedsValue = (operator: string): boolean => {
    const noValueOps = ["is empty", "is not empty", "exists", "does not exist", "is true", "is false"];
    return !noValueOps.includes(operator);
  };

  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <FilterConditionRow
          key={`${index}-${row.fieldType}`}
          row={row}
          index={index}
          rows={rows}
          onChange={onChange}
          getOperatorsByType={getOperatorsByType}
          operatorNeedsValue={operatorNeedsValue}
          fieldTypes={fieldTypes}
          stepOutputs={stepOutputs}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { field: "", fieldType: "", operator: "", value: "" }])}
        className="w-full rounded-md border-2 border-dashed border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50"
      >
        + Add Condition
      </button>
      <p className="text-xs text-ink-500">
        Drag fields from DATA panel → Select type → Choose operator → Set value (if needed)
      </p>
    </div>
  );
}

// Separate component for filter condition row
interface FilterConditionRowProps {
  row: FilterConditionRow;
  index: number;
  rows: FilterConditionRow[];
  onChange: (rows: FilterConditionRow[]) => void;
  getOperatorsByType: (fieldType: string) => { value: string; label: string }[];
  operatorNeedsValue: (operator: string) => boolean;
  fieldTypes: { value: string; label: string }[];
  stepOutputs: Record<string, unknown>;
}

function FilterConditionRow({
  row,
  index,
  rows,
  onChange,
  getOperatorsByType,
  operatorNeedsValue,
  fieldTypes,
  stepOutputs
}: FilterConditionRowProps): JSX.Element {
  const operators = getOperatorsByType(row.fieldType);
  const needsValue = operatorNeedsValue(row.operator);

  console.log(`[Filter Render] Row ${index}: fieldType=${row.fieldType}, operator=${row.operator}`);
  console.log(`[Filter Render] Available operators:`, operators.map(op => op.value));

  return (
          <div key={`${index}-${row.fieldType}`} className="space-y-2 rounded-lg border-2 border-ink-200 bg-ink-50 p-3">
            {/* Row 1: Field, Type, Operator, Delete button */}
            <div className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-5">
                <label className="block text-[10px] font-semibold text-ink-600 mb-1">Field (drag token)</label>
                <TokenizedInput
                  value={row.field}
                  onChange={(newValue) => {
                    const updated = [...rows];
                    updated[index] = { ...updated[index], field: newValue };
                    onChange(updated);
                  }}
                  onBlur={() => {}}
                  placeholder="{{steps.manual1.field}}"
                  stepOutputs={stepOutputs}
                  className="w-full rounded-md border border-ink-200 px-2 py-2 text-sm focus:border-indigo-400"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-[10px] font-semibold text-ink-600 mb-1">Type</label>
                <select
                  value={row.fieldType}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    const newType = event.target.value;
                    const newOperators = getOperatorsByType(newType);
                    const newOperator = newOperators[0]?.value || "";
                    
                    console.log(`[Filter] Type changed from ${row.fieldType} to ${newType}`);
                    console.log(`[Filter] Old operator: ${row.operator}, New operator: ${newOperator}`);
                    console.log(`[Filter] Available operators:`, newOperators.map(op => op.value));
                    
                    // Create completely new array to force React update
                    const updated = rows.map((r, i) => {
                      if (i === index) {
                        return {
                          field: r.field,
                          fieldType: newType,
                          operator: newOperator,
                          value: operatorNeedsValue(newOperator) ? r.value : ""
                        };
                      }
                      return { ...r };
                    });
                    
                    onChange(updated);
                  }}
                  className="w-full rounded-md border border-ink-200 px-2 py-2 text-xs focus:border-indigo-400"
                  title="Field Type"
                >
                  {fieldTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-3">
                <label className="block text-[10px] font-semibold text-ink-600 mb-1">Operator</label>
                <select
                  key={`operator-${index}-${row.fieldType}`}
                  value={row.operator}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    const updated = [...rows];
                    updated[index] = { ...updated[index], operator: event.target.value };
                    onChange(updated);
                  }}
                  className="w-full rounded-md border border-ink-200 px-2 py-2 text-xs focus:border-indigo-400"
                  title="Operator"
                  disabled={!row.fieldType || operators.length === 0}
                >
                  {operators.length === 0 ? (
                    <option value="">-- Select Type first --</option>
                  ) : (
                    <>
                      <option value="">-- Select Operator --</option>
                      {operators.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="col-span-1 flex justify-end pt-5">
                <button
                  type="button"
                  onClick={() => {
                    const updated = rows.filter((_, i) => i !== index);
                    onChange(updated.length ? updated : [{ field: "", fieldType: "", operator: "", value: "" }]);
                  }}
                  className="text-rose-500 hover:text-rose-600 text-xl"
                  title="Remove condition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Row 2: Value input full width */}
            <div>
              <label className="block text-[10px] font-semibold text-ink-600 mb-1">Value</label>
              <TokenizedInput
                value={row.value}
                onChange={(newValue) => {
                  const updated = [...rows];
                  updated[index] = { ...updated[index], value: newValue };
                  onChange(updated);
                }}
                onBlur={() => {}}
                placeholder={!row.operator ? "Select operator first" : needsValue ? `Enter ${row.fieldType || 'value'} or drag token` : "No value needed for this operator"}
                stepOutputs={stepOutputs}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400"
              />
            </div>
          </div>
      );
}

function ColumnEditor({ value, onChange }: ColumnEditorProps): JSX.Element {
  // Ensure we have proper column structure
  let rows = value;
  if (!Array.isArray(rows) || rows.length === 0) {
    rows = [{ sourceField: "", targetField: "", targetType: "string", transformExpression: "" }];
  }
  
  rows = rows.map(row => ({
    sourceField: row.sourceField || "",
    targetField: row.targetField || "",
    targetType: row.targetType || "string",
    transformExpression: row.transformExpression || ""
  }));

  const typeOptions = [
    { value: "string", label: "String" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "date", label: "Date" },
    { value: "array", label: "Array" },
    { value: "object", label: "Object" },
  ];

  // Hook for drag-drop
  const useFieldDrop = (index: number) => {
    return useDrop<DataFieldDragItem, void, { isOver: boolean }>(() => ({
      accept: DATA_FIELD_ITEM_TYPE,
      drop: (item: DataFieldDragItem) => {
        const updated = [...rows];
        updated[index] = { ...updated[index], sourceField: item.token };
        onChange(updated);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));
  };

  return (
    <div className="space-y-4">
      {rows.map((row, index) => {
        const [{ isOver }, dropRef] = useFieldDrop(index);

        return (
          <div key={index} className="space-y-2 rounded-lg border-2 border-ink-200 bg-ink-50 p-3">
            {/* Row 1: Source Field */}
            <div>
              <label className="block text-[10px] font-semibold text-ink-600 mb-1">
                Source Field (drag token or leave empty to delete)
              </label>
              <div
                ref={dropRef}
                className={`relative transition-all ${
                  isOver 
                    ? "ring-4 ring-indigo-400 rounded-lg bg-indigo-50 p-1" 
                    : "hover:ring-2 hover:ring-indigo-200 rounded-lg"
                }`}
              >
                {isOver && (
                  <div className="absolute -top-7 left-0 right-0 z-10 flex items-center justify-center">
                    <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                      ⬇️ DROP
                    </span>
                  </div>
                )}
                <input
                  type="text"
                  value={row.sourceField}
                  placeholder="{{steps.manual1.name}} or leave empty to add new field"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const updated = [...rows];
                    updated[index] = { ...updated[index], sourceField: event.target.value };
                    onChange(updated);
                  }}
                  className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Row 2: Target Field + Type + Delete */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <label className="block text-[10px] font-semibold text-ink-600 mb-1">Target Field Name</label>
                <input
                  type="text"
                  value={row.targetField}
                  placeholder="newFieldName"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const updated = [...rows];
                    updated[index] = { ...updated[index], targetField: event.target.value };
                    onChange(updated);
                  }}
                  className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400"
                />
              </div>

              <div className="col-span-5">
                <label className="block text-[10px] font-semibold text-ink-600 mb-1">Target Type</label>
                <select
                  value={row.targetType}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    const updated = [...rows];
                    updated[index] = { ...updated[index], targetType: event.target.value };
                    onChange(updated);
                  }}
                  className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400"
                  title="Target Type"
                >
                  {typeOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 flex justify-end pt-5">
                <button
                  type="button"
                  onClick={() => {
                    const updated = rows.filter((_, i) => i !== index);
                    onChange(updated.length ? updated : [{ sourceField: "", targetField: "", targetType: "string", transformExpression: "" }]);
                  }}
                  className="text-rose-500 hover:text-rose-600 text-xl"
                  title="Remove column"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Row 3: Transform Expression (optional) */}
            <div>
              <label className="block text-[10px] font-semibold text-ink-600 mb-1">
                Transform Expression (optional) - JS expression
              </label>
              <input
                type="text"
                value={row.transformExpression || ""}
                placeholder="value.toUpperCase() or value * 2 or value.substring(0, 10)"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const updated = [...rows];
                  updated[index] = { ...updated[index], transformExpression: event.target.value };
                  onChange(updated);
                }}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400 font-mono text-xs"
              />
              <p className="text-[10px] text-ink-500 mt-1">
                Use <code className="bg-ink-200 px-1 rounded">value</code> for source field value, 
                <code className="bg-ink-200 px-1 rounded mx-1">item</code> for whole object
              </p>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...rows, { sourceField: "", targetField: "", targetType: "string", transformExpression: "" }])}
        className="w-full rounded-md border-2 border-dashed border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50"
      >
        + Add Column Operation
      </button>
      <p className="text-xs text-ink-500">
        Drag fields from DATA panel → Set target name & type → Optionally add transform expression
      </p>
    </div>
  );
}

interface ChipsEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

function ChipsEditor({ value, onChange }: ChipsEditorProps): JSX.Element {
  const [draft, setDraft] = useState("");

  // Safety check: if value contains objects, extract string representation
  const safeValue = value.map(chip => {
    if (typeof chip === 'object' && chip !== null) {
      console.error('[ChipsEditor] Received object instead of string:', chip);
      // Try to extract a string representation
      return (chip as any).key || (chip as any).value || JSON.stringify(chip);
    }
    return String(chip);
  });

  return (
    <div className="space-y-2">
      {/* Chips container with border - looks like single input field */}
      <div className="min-h-[42px] flex flex-wrap gap-2 items-center rounded-md border border-ink-200 bg-white px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
        {safeValue.map((chip, index) => (
          <span key={`${chip}-${index}`} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700 font-medium shadow-sm">
            <span>{chip}</span>
            <button
              type="button"
              className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
              onClick={() => onChange(safeValue.filter((_, i) => i !== index))}
              title="Remove"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && draft.trim()) {
              event.preventDefault();
              onChange([...value, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder={value.length === 0 ? "Type and press Enter, or drag fields here" : ""}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
        />
      </div>
      <p className="text-xs text-ink-500">💡 Type field names and press Enter, or drag from DATA panel</p>
    </div>
  );
}

function buildSchema(fields: FieldDef[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    const schema = fieldToZod(field);
    if (schema) {
      shape[field.key] = field.required ? schema : schema.optional();
    }
  });

  return z.object(shape).passthrough();
}

function fieldToZod(field: FieldDef): z.ZodTypeAny | null {
  switch (field.type) {
    case "string":
    case "email":
    case "url":
    case "datetime":
      return applyStringConstraints(z.string(), field);
    case "number": {
      const baseNumber = applyNumberConstraints(z.number(), field);
      return z.preprocess((value) => {
        if (typeof value === "string" && value.trim() === "") {
          return undefined;
        }
        if (typeof value === "number") {
          return value;
        }
        if (typeof value === "string") {
          const parsed = Number(value);
          return Number.isNaN(parsed) ? undefined : parsed;
        }
        return value;
      }, baseNumber);
    }
    case "boolean":
      return z.boolean();
    case "enum":
      return z.enum((field.enum ?? [""]) as [string, ...string[]]);
    case "object":
      if (field.widget === "keyValue" || field.widget === "keyValueWithType") {
        return z
          .array(
            z.object({
              key: z.string().min(1, "Required"),
              value: z.string().optional(),
              sensitive: z.boolean().optional(),
              type: z.string().optional(),
            })
          )
          .default([]);
      }
      if (field.widget === "json-editor") {
        return z
          .string()
          .refine((value) => {
            if (!value) {
              return true;
            }
            try {
              JSON.parse(value);
              return true;
            } catch {
              return false;
            }
          }, "Invalid JSON");
      }
      return z.any();
    case "array":
      if (field.widget === "chips") {
        return z.array(z.string()).default([]);
      }
      return z.array(z.any());
    default:
      return z.any();
  }
}

function applyStringConstraints(schema: z.ZodString, field: FieldDef): z.ZodString {
  let result = schema;
  if (field.min) {
    result = result.min(field.min, `Min ${field.min}`);
  }
  if (field.max) {
    result = result.max(field.max, `Max ${field.max}`);
  }
  if (field.pattern) {
    result = result.regex(new RegExp(field.pattern), "Invalid pattern");
  }
  if (field.type === "email") {
    result = result.email("Invalid email");
  }
  if (field.type === "url") {
    result = result.url("Invalid URL");
  }
  return result;
}

function applyNumberConstraints(schema: z.ZodNumber, field: FieldDef): z.ZodNumber {
  let result = schema;
  if (typeof field.min === "number") {
    result = result.min(field.min, `>= ${field.min}`);
  }
  if (typeof field.max === "number") {
    result = result.max(field.max, `<= ${field.max}`);
  }
  return result;
}

type FieldGroupMap = Record<TabKey, FieldDef[]> & Record<string, FieldDef[]>;

function groupFields(fields: FieldDef[]): FieldGroupMap {
  const baseGroups: Record<TabKey, FieldDef[]> = {
    inputs: [],
    auth: [],
    advanced: [],
    validation: [],
  };
  const groups: FieldGroupMap = { ...baseGroups } as FieldGroupMap;
  fields.forEach((field) => {
    const key = (field.group ?? "inputs") as TabKey | string;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(field);
  });
  return groups;
}

function tabLabel(tab?: FieldDef["group"]): string {
  switch (tab) {
    case "auth":
      return "Auth";
    case "advanced":
      return "Advanced";
    case "validation":
      return "Validation";
    default:
      return "Inputs";
  }
}

function useTokenDrop(onToken: (token: string) => void) {
  return useDrop<DataFieldDragItem, void, { isOver: boolean }>(() => ({
    accept: DATA_FIELD_ITEM_TYPE,
    drop: (item) => onToken(item.token),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));
}

function shouldHideField(field: FieldDef, currentMode?: string, currentBodyMode?: string): boolean {
  // Old IF node fields are removed, no need to hide anything for IF node anymore
  
  // For SWITCH node: hide filterPath in single mode
  if (currentMode === "single" && field.key === "filterPath") {
    return true;
  }
  
  // For MANUAL node: hide jsonPayload in form mode, hide formFields in json mode
  if (currentMode === "json" && field.key === "formFields") {
    return true;
  }
  if (currentMode === "form" && field.key === "jsonPayload") {
    return true;
  }
  
  // For HTTP node: conditional body fields based on bodyMode
  if (currentBodyMode) {
    const bodyFields = ["jsonBody", "formDataBody", "formUrlEncodedBody", "rawBody"];
    
    // If this is a body field, check if it matches current mode
    if (bodyFields.includes(field.key)) {
      if (currentBodyMode === "none") {
        return true; // Hide all body fields when mode is "none"
      }
      
      // Show only the matching body field
      switch (currentBodyMode) {
        case "json":
          return field.key !== "jsonBody";
        case "form-data":
          return field.key !== "formDataBody";
        case "x-www-form-urlencoded":
          return field.key !== "formUrlEncodedBody";
        case "raw":
          return field.key !== "rawBody";
        default:
          return true;
      }
    }
  }
  
  // For SPLIT node: hide fieldPath when mode is "auto"
  if (currentMode === "auto" && field.key === "fieldPath") {
    return true;
  }
  
  // For MERGE node: show only relevant fields based on mode
  if (currentMode === "append" && (field.key === "mergeStrategy" || field.key === "joinKey1" || field.key === "joinKey2" || field.key === "joinType" || field.key === "flattenJoined")) {
    return true; // Hide merge and join fields in append mode
  }
  if (currentMode === "merge" && (field.key === "removeDuplicates" || field.key === "joinKey1" || field.key === "joinKey2" || field.key === "joinType" || field.key === "flattenJoined")) {
    return true; // Hide append and join fields in merge mode
  }
  if (currentMode === "join" && (field.key === "removeDuplicates" || field.key === "mergeStrategy")) {
    return true; // Hide append and merge fields in join mode
  }
  
  return false;
}

function supportsTokenDrop(field: FieldDef): boolean {
  // Support all text-based inputs
  if (field.type === "string" || field.type === "url" || field.type === "email") {
    return true;
  }
  
  // Support number inputs (tokens can resolve to numbers)
  if (field.type === "number") {
    return true;
  }
  
  // Support special widgets
  if (field.widget && ["textarea", "json-editor", "code", "chips"].includes(field.widget)) {
    return true;
  }
  
  // Don't support boolean checkboxes or select dropdowns
  if (field.type === "boolean" || field.type === "enum") {
    return false;
  }
  
  // Default: allow drop for most fields
  return true;
}

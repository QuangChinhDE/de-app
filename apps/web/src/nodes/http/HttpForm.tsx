import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import classNames from "classnames";
import type { NodeFormProps } from "@node-playground/types";
import type { HttpNodeConfig } from "@node-playground/types";
import { TokenizedInput } from "../../components/form-system/TokenizedInput";
import { KeyValueEditor } from "../../components/form-system/KeyValueEditor";
import { Input, Select, Textarea, Button } from "../../design-system/primitives";

/**
 * HttpForm - STANDALONE form for HTTP node
 * Extracted all necessary logic from SchemaForm.tsx
 * No dependency on SchemaForm anymore!
 */

// Validation schema for HTTP node
const httpValidationSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().url("Invalid URL").min(1, "URL is required"),
  queryParams: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  headers: z.array(z.object({ 
    key: z.string(), 
    value: z.string(), 
    sensitive: z.boolean().optional(),
    type: z.string().optional() 
  })).optional(),
  bodyMode: z.enum(["json", "form", "multipart", "raw"]).optional(),
  jsonBody: z.string().optional(),
  formBody: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  multipartBody: z.array(z.object({ key: z.string(), value: z.string(), type: z.enum(["text", "file"]).optional() })).optional(),
  rawBody: z.string().optional(),
}).passthrough();

export function HttpForm({ 
  schema, 
  value, 
  onChange, 
  onRun, 
  isRunning,
  stepOutputs = {} 
}: NodeFormProps<HttpNodeConfig>): JSX.Element {
  const [activeTab, setActiveTab] = useState<"inputs" | "auth" | "advanced">("inputs");

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<HttpNodeConfig>({
    resolver: zodResolver(httpValidationSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const bodyMode = watch("bodyMode");

  useEffect(() => {
    reset(value);
  }, [value, reset]);

  useEffect(() => {
    const subscription = watch((formValues) => {
      onChange(formValues as HttpNodeConfig);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const submitHandler = handleSubmit((formValues) => {
    onRun(formValues);
  });

  return (
    <form className="flex h-full flex-col" onSubmit={submitHandler}>
      {/* Header with tabs and Run button */}
      <div className="flex items-center gap-2 border-b border-ink-200 px-4 py-2">
        <button
          type="button"
          onClick={() => setActiveTab("inputs")}
          className={classNames(
            "rounded-md px-3 py-1 text-sm font-medium",
            activeTab === "inputs"
              ? "bg-indigo-500 text-white"
              : "text-ink-500 hover:bg-ink-100 hover:text-ink-700"
          )}
        >
          Inputs
        </button>
        
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
        {activeTab === "inputs" && (
          <div className="space-y-4">
            {/* Method */}
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-ink-600">Method</label>
                  <Select {...field} error={!!errors.method}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </Select>
                  {errors.method && (
                    <p className="text-xs text-rose-600">{errors.method.message}</p>
                  )}
                </div>
              )}
            />

            {/* URL */}
            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-ink-600">Request URL</label>
                  <TokenizedInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="https://api.example.com/resource"
                    stepOutputs={stepOutputs}
                    className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none"
                  />
                  <p className="text-xs text-ink-500">
                    Full URL or use tokens like {`{{steps.manual1.apiUrl}}`}
                  </p>
                  {errors.url && (
                    <p className="text-xs text-rose-600">{errors.url.message}</p>
                  )}
                </div>
              )}
            />

            {/* Query Params */}
            <Controller
              name="queryParams"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-ink-600">Query Params</label>
                  <KeyValueEditor
                    value={(field.value as any) || []}
                    onChange={field.onChange}
                    stepOutputs={stepOutputs}
                  />
                </div>
              )}
            />

            {/* Headers */}
            <Controller
              name="headers"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-ink-600">Headers</label>
                  <KeyValueEditor
                    value={(field.value as any) || []}
                    onChange={field.onChange}
                    allowType={true}
                    stepOutputs={stepOutputs}
                  />
                </div>
              )}
            />

            {/* Body Mode */}
            <Controller
              name="bodyMode"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-ink-600">Body Mode</label>
                  <Select {...field} value={field.value || ""}>
                    <option value="">None</option>
                    <option value="json">JSON</option>
                    <option value="form">Form (URL Encoded)</option>
                    <option value="multipart">Multipart (Form Data)</option>
                    <option value="raw">Raw</option>
                  </Select>
                  <p className="text-xs text-ink-500">Select body format (like Postman)</p>
                </div>
              )}
            />

            {/* Conditional Body Fields */}
            {bodyMode === "json" && (
              <Controller
                name="jsonBody"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-ink-600">JSON Body</label>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      rows={8}
                      placeholder='{"key": "value"}'
                      className="font-mono"
                    />
                    <p className="text-xs text-ink-500">
                      Request body as JSON object. Tokens are supported.
                    </p>
                  </div>
                )}
              />
            )}

            {bodyMode === "form" && (
              <Controller
                name="formBody"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-ink-600">Form Body (URL Encoded)</label>
                    <KeyValueEditor
                      value={(field.value as any) || []}
                      onChange={field.onChange}
                      stepOutputs={stepOutputs}
                    />
                  </div>
                )}
              />
            )}

            {bodyMode === "multipart" && (
              <Controller
                name="multipartBody"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-ink-600">Multipart Body (Form Data)</label>
                    <KeyValueEditor
                      value={(field.value as any) || []}
                      onChange={field.onChange}
                      stepOutputs={stepOutputs}
                    />
                  </div>
                )}
              />
            )}

            {bodyMode === "raw" && (
              <Controller
                name="rawBody"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-ink-600">Raw Body</label>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      rows={8}
                      placeholder="Raw request body"
                      className="font-mono"
                    />
                  </div>
                )}
              />
            )}
          </div>
        )}
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

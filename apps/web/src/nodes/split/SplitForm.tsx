import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button, Input } from "../../design-system/primitives";
import { TokenizedInput } from "../../components/form-system/TokenizedInput";

interface SplitNodeConfig {
  mode: "auto" | "field";
  fieldPath: string;
}

const splitSchema = z.object({
  mode: z.enum(["auto", "field"]),
  fieldPath: z.string(),
});

export function SplitForm({ schema, value, onChange, onRun, isRunning, stepOutputs = {} }: NodeFormProps<SplitNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SplitNodeConfig>({
    resolver: zodResolver(splitSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const mode = watch("mode");
  const fieldPath = watch("fieldPath");

  const handleModeChange = (newMode: "auto" | "field") => {
    setValue("mode", newMode, { shouldValidate: true });
    onChange({ ...value, mode: newMode });
  };

  const handleFieldPathChange = (newPath: string) => {
    setValue("fieldPath", newPath, { shouldValidate: true });
    onChange({ ...value, fieldPath: newPath });
  };

  const onSubmit = handleSubmit((data: SplitNodeConfig) => {
    onRun(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Mode */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Mode
            <span className="ml-2 text-xs font-normal text-ink-500">
              (How to split the array)
            </span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleModeChange("auto")}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                mode === "auto"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              🔍 Auto Detect
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("field")}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                mode === "field"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              🎯 Specify Field
            </button>
          </div>
          <p className="text-xs text-ink-500">
            {mode === "auto" 
              ? "Automatically detects array from previous output" 
              : "Manually specify field path to array"}
          </p>
        </div>

        {/* Field Path (only for 'field' mode) */}
        {mode === "field" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink-700">
              Field Path
              <span className="ml-2 text-xs font-normal text-ink-500">
                (Path to array field)
              </span>
            </label>
            <TokenizedInput
              value={fieldPath}
              onChange={handleFieldPathChange}
              onBlur={() => {}}
              placeholder="e.g., items or {{steps.http.data.items}}"
              stepOutputs={stepOutputs}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400"
            />
            {errors.fieldPath && (
              <p className="text-xs text-rose-600">{errors.fieldPath.message}</p>
            )}
            <p className="text-xs text-ink-500">
              Drag token from Result Panel or type field name
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm font-semibold text-indigo-700 mb-2">
            ℹ️ How Split Works
          </p>
          <ul className="space-y-1 text-xs text-indigo-600">
            <li>• Takes an array input</li>
            <li>• Outputs each item individually</li>
            <li>• Useful for processing items one by one</li>
            <li>• Connect to Loop node to iterate</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-ink-200 px-4 py-3">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isRunning}
        >
          {isRunning ? "Running..." : "▶ Run Step"}
        </Button>
      </div>
    </form>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button, Input } from "../../design-system/primitives";
import { TokenizedInput } from "../../components/form-system/TokenizedInput";
import { CasesEditor } from "../../components/form-system/CasesEditor";

interface SwitchNodeConfig {
  mode: "single" | "filter";
  value: string;
  filterPath: string;
  cases: string[];
  defaultCase: string;
}

const switchSchema = z.object({
  mode: z.enum(["single", "filter"]),
  value: z.string().min(1, "Value/Array is required"),
  filterPath: z.string(),
  cases: z.array(z.string()).min(1, "At least one case is required"),
  defaultCase: z.string(),
});

export function SwitchForm({ schema, value, onChange, onRun, isRunning, stepOutputs = {} }: NodeFormProps<SwitchNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SwitchNodeConfig>({
    resolver: zodResolver(switchSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const mode = watch("mode");
  const valueField = watch("value");
  const filterPath = watch("filterPath");
  const cases = watch("cases");
  const defaultCase = watch("defaultCase");

  const handleModeChange = (newMode: "single" | "filter") => {
    setValue("mode", newMode, { shouldValidate: true });
    onChange({ ...value, mode: newMode });
  };

  const handleValueChange = (newValue: string) => {
    setValue("value", newValue, { shouldValidate: true });
    onChange({ ...value, value: newValue });
  };

  const handleFilterPathChange = (newPath: string) => {
    setValue("filterPath", newPath, { shouldValidate: true });
    onChange({ ...value, filterPath: newPath });
  };

  const handleCasesChange = (newCases: string[]) => {
    setValue("cases", newCases, { shouldValidate: true });
    onChange({ ...value, cases: newCases });
  };

  const handleDefaultCaseChange = (newDefault: string) => {
    setValue("defaultCase", newDefault, { shouldValidate: true });
    onChange({ ...value, defaultCase: newDefault });
  };

  const onSubmit = handleSubmit((data: SwitchNodeConfig) => {
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
              (Single: match one value | Filter: split array by property)
            </span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleModeChange("single")}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                mode === "single"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              Single Value
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("filter")}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                mode === "filter"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              Filter Array
            </button>
          </div>
        </div>

        {/* Value/Array */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            {mode === "single" ? "Value to Match" : "Array to Split"}
            <span className="ml-2 text-xs font-normal text-ink-500">
              {mode === "single" 
                ? "(Single value or token like {{steps.http1.status}})" 
                : "(Array or token like {{steps.manual1}})"}
            </span>
          </label>
          <TokenizedInput
            value={valueField}
            onChange={handleValueChange}
            onBlur={() => {}}
            placeholder={mode === "single" ? "{{steps.setVariable1}}" : "{{steps.manual1}}"}
            stepOutputs={stepOutputs}
            className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400"
          />
          {errors.value && (
            <p className="text-xs text-rose-600">{errors.value.message}</p>
          )}
        </div>

        {/* Filter Path (only for filter mode) */}
        {mode === "filter" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink-700">
              Filter Path
              <span className="ml-2 text-xs font-normal text-ink-500">
                (Object property to check, e.g., 'status', 'type')
              </span>
            </label>
            <Input
              value={filterPath}
              onChange={(e) => handleFilterPathChange(e.target.value)}
              placeholder="status"
              fullWidth
            />
            {errors.filterPath && (
              <p className="text-xs text-rose-600">{errors.filterPath.message}</p>
            )}
          </div>
        )}

        {/* Cases */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Cases
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Each case creates an output handle)
            </span>
          </label>
          <CasesEditor
            value={cases}
            onChange={handleCasesChange}
            stepOutputs={stepOutputs}
          />
          {errors.cases && (
            <p className="text-xs text-rose-600">{errors.cases.message}</p>
          )}
        </div>

        {/* Default Case */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Default Case
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Optional: label for unmatched values)
            </span>
          </label>
          <Input
            value={defaultCase}
            onChange={(e) => handleDefaultCaseChange(e.target.value)}
            placeholder="default"
            fullWidth
          />
          {errors.defaultCase && (
            <p className="text-xs text-rose-600">{errors.defaultCase.message}</p>
          )}
        </div>
      </div>
    </form>
  );
}

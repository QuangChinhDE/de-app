import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button, Input, Select } from "../../design-system/primitives";
import { TokenizedInput } from "../../components/form-system/TokenizedInput";

interface SortNodeConfig {
  items: string;
  field: string;
  direction: "asc" | "desc";
  dataType: "auto" | "number" | "string" | "date";
}

const sortSchema = z.object({
  items: z.string(),
  field: z.string().min(1, "Field name is required"),
  direction: z.enum(["asc", "desc"]),
  dataType: z.enum(["auto", "number", "string", "date"]),
});

export function SortForm({ schema, value, onChange, onRun, isRunning, stepOutputs = {} }: NodeFormProps<SortNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SortNodeConfig>({
    resolver: zodResolver(sortSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const items = watch("items");
  const field = watch("field");
  const direction = watch("direction");
  const dataType = watch("dataType");

  const handleItemsChange = (newItems: string) => {
    setValue("items", newItems, { shouldValidate: true });
    onChange({ ...value, items: newItems });
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newField = e.target.value;
    setValue("field", newField, { shouldValidate: true });
    onChange({ ...value, field: newField });
  };

  const handleDirectionChange = (newDirection: "asc" | "desc") => {
    setValue("direction", newDirection, { shouldValidate: true });
    onChange({ ...value, direction: newDirection });
  };

  const handleDataTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDataType = e.target.value as SortNodeConfig["dataType"];
    setValue("dataType", newDataType, { shouldValidate: true });
    onChange({ ...value, dataType: newDataType });
  };

  const onSubmit = handleSubmit((data: SortNodeConfig) => {
    onRun(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Items to Sort */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Items to Sort
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Array to sort - leave empty to use previous output)
            </span>
          </label>
          <TokenizedInput
            value={items}
            onChange={handleItemsChange}
            onBlur={() => {}}
            placeholder="{{steps.xxx}} - Must be an array"
            stepOutputs={stepOutputs}
            className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400 font-mono"
          />
          {errors.items && (
            <p className="text-xs text-rose-600">{errors.items.message}</p>
          )}
        </div>

        {/* Sort By Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Sort By Field
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Property name to sort by)
            </span>
          </label>
          <Input
            value={field}
            onChange={handleFieldChange}
            placeholder="age"
            fullWidth
          />
          {errors.field && (
            <p className="text-xs text-rose-600">{errors.field.message}</p>
          )}
          <p className="text-xs text-ink-500">
            Examples: 'age', 'price', 'date', 'name'
          </p>
        </div>

        {/* Sort Direction */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Sort Direction
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Order of sorting)
            </span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleDirectionChange("asc")}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                direction === "asc"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              ↑ Ascending (1→9, A→Z)
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange("desc")}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                direction === "desc"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              ↓ Descending (9→1, Z→A)
            </button>
          </div>
        </div>

        {/* Data Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Data Type
            <span className="ml-2 text-xs font-normal text-ink-500">
              (How to interpret field values)
            </span>
          </label>
          <Select
            value={dataType}
            onChange={handleDataTypeChange}
            fullWidth
          >
            <option value="auto">Auto Detect</option>
            <option value="number">Number (1, 2, 10, 20)</option>
            <option value="string">String (A, B, a, b)</option>
            <option value="date">Date & Time</option>
          </Select>
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

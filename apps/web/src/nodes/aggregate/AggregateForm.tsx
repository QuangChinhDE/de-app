import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button, Input, Select } from "../../design-system/primitives";
import { TokenizedInput } from "../../components/form-system/TokenizedInput";

interface AggregateNodeConfig {
  items: string;
  operation: "sum" | "count" | "avg" | "min" | "max" | "groupBy";
  field: string;
  groupByField: string;
  groupOperation: "sum" | "count" | "avg" | "min" | "max";
  groupOperationField: string;
}

const aggregateSchema = z.object({
  items: z.string(),
  operation: z.enum(["sum", "count", "avg", "min", "max", "groupBy"]),
  field: z.string(),
  groupByField: z.string(),
  groupOperation: z.enum(["sum", "count", "avg", "min", "max"]),
  groupOperationField: z.string(),
});

export function AggregateForm({ schema, value, onChange, onRun, isRunning, stepOutputs = {} }: NodeFormProps<AggregateNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AggregateNodeConfig>({
    resolver: zodResolver(aggregateSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const items = watch("items");
  const operation = watch("operation");
  const field = watch("field");
  const groupByField = watch("groupByField");
  const groupOperation = watch("groupOperation");
  const groupOperationField = watch("groupOperationField");

  const isGroupBy = operation === "groupBy";
  const needsField = ["sum", "avg", "min", "max"].includes(operation);

  const handleChange = (key: keyof AggregateNodeConfig, newValue: string) => {
    setValue(key, newValue as never, { shouldValidate: true });
    onChange({ ...value, [key]: newValue });
  };

  const onSubmit = handleSubmit((data: AggregateNodeConfig) => {
    onRun(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Items */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Items to Aggregate
          </label>
          <TokenizedInput
            value={items}
            onChange={(v) => handleChange("items", v)}
            onBlur={() => {}}
            placeholder="{{steps.xxx}} - Must be an array"
            stepOutputs={stepOutputs}
            className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400 font-mono"
          />
        </div>

        {/* Operation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">Operation</label>
          <Select
            value={operation}
            onChange={(e) => handleChange("operation", e.target.value)}
            fullWidth
          >
            <option value="sum">Sum (Total)</option>
            <option value="count">Count (Number of items)</option>
            <option value="avg">Average (Mean)</option>
            <option value="min">Minimum</option>
            <option value="max">Maximum</option>
            <option value="groupBy">Group By</option>
          </Select>
        </div>

        {/* Field (for sum/avg/min/max) */}
        {needsField && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink-700">
              Field to Aggregate
            </label>
            <Input
              value={field}
              onChange={(e) => handleChange("field", e.target.value)}
              placeholder="amount"
              fullWidth
            />
            <p className="text-xs text-ink-500">
              Field name to perform {operation} on (e.g., 'price', 'quantity')
            </p>
          </div>
        )}

        {/* Group By Fields */}
        {isGroupBy && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink-700">
                Group By Field
              </label>
              <Input
                value={groupByField}
                onChange={(e) => handleChange("groupByField", e.target.value)}
                placeholder="category"
                fullWidth
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink-700">
                Group Operation
              </label>
              <Select
                value={groupOperation}
                onChange={(e) => handleChange("groupOperation", e.target.value)}
                fullWidth
              >
                <option value="count">Count</option>
                <option value="sum">Sum</option>
                <option value="avg">Average</option>
                <option value="min">Minimum</option>
                <option value="max">Maximum</option>
              </Select>
            </div>

            {["sum", "avg", "min", "max"].includes(groupOperation) && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink-700">
                  Group Operation Field
                </label>
                <Input
                  value={groupOperationField}
                  onChange={(e) => handleChange("groupOperationField", e.target.value)}
                  placeholder="amount"
                  fullWidth
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-ink-200 px-4 py-3">
        <Button type="submit" variant="primary" fullWidth disabled={isRunning}>
          {isRunning ? "Running..." : "▶ Run Step"}
        </Button>
      </div>
    </form>
  );
}

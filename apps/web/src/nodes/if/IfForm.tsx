import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button } from "../../design-system/primitives";
import { FilterConditionsEditor, type FilterConditionRow } from "../../components/form-system/FilterConditionsEditor";

interface IfNodeConfig {
  conditions: FilterConditionRow[];
  logic: "AND" | "OR";
}

const ifSchema = z.object({
  conditions: z.array(
    z.object({
      field: z.string().min(1, "Field is required"),
      fieldType: z.string().min(1, "Type is required"),
      operator: z.string().min(1, "Operator is required"),
      value: z.string(),
    })
  ).min(1, "At least one condition is required"),
  logic: z.enum(["AND", "OR"]),
});

export function IfForm({ schema, value, onChange, onRun, isRunning, stepOutputs = {} }: NodeFormProps<IfNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IfNodeConfig>({
    resolver: zodResolver(ifSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const conditions = watch("conditions");
  const logic = watch("logic");

  const handleConditionsChange = (newConditions: FilterConditionRow[]) => {
    setValue("conditions", newConditions, { shouldValidate: true });
    onChange({ ...value, conditions: newConditions });
  };

  const handleLogicChange = (newLogic: "AND" | "OR") => {
    setValue("logic", newLogic, { shouldValidate: true });
    onChange({ ...value, logic: newLogic });
  };

  const onSubmit = handleSubmit((data: IfNodeConfig) => {
    onRun(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Logic Operator */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Logic Operator
            <span className="ml-2 text-xs font-normal text-ink-500">
              (AND: all must pass | OR: at least one must pass)
            </span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleLogicChange("AND")}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                logic === "AND"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              AND (All)
            </button>
            <button
              type="button"
              onClick={() => handleLogicChange("OR")}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                logic === "OR"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              OR (Any)
            </button>
          </div>
        </div>

        {/* Conditions */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Filter Conditions
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Items split into TRUE/FALSE branches)
            </span>
          </label>
          <FilterConditionsEditor
            value={conditions}
            onChange={handleConditionsChange}
            stepOutputs={stepOutputs}
          />
          {errors.conditions && (
            <p className="text-xs text-rose-600">{errors.conditions.message}</p>
          )}
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

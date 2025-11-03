import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button, Input } from "../../design-system/primitives";
import { TokenizedInput } from "../../components/form-system/TokenizedInput";

interface LimitNodeConfig {
  items: string;
  skip: number;
  limit: number;
}

const limitSchema = z.object({
  items: z.string(),
  skip: z.number().min(0, "Skip must be >= 0"),
  limit: z.number().min(1, "Limit must be >= 1"),
});

export function LimitForm({ schema, value, onChange, onRun, isRunning, stepOutputs = {} }: NodeFormProps<LimitNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<LimitNodeConfig>({
    resolver: zodResolver(limitSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const items = watch("items");
  const skip = watch("skip");
  const limit = watch("limit");

  const handleItemsChange = (newItems: string) => {
    setValue("items", newItems, { shouldValidate: true });
    onChange({ ...value, items: newItems });
  };

  const handleSkipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSkip = parseInt(e.target.value) || 0;
    setValue("skip", newSkip, { shouldValidate: true });
    onChange({ ...value, skip: newSkip });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(e.target.value) || 10;
    setValue("limit", newLimit, { shouldValidate: true });
    onChange({ ...value, limit: newLimit });
  };

  const onSubmit = handleSubmit((data: LimitNodeConfig) => {
    onRun(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Items to Limit */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Items to Limit
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Array to slice - leave empty to use previous output)
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

        {/* Skip (Offset) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Skip (Offset)
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Number of items to skip from beginning)
            </span>
          </label>
          <Input
            type="number"
            {...register("skip", { valueAsNumber: true })}
            value={skip}
            onChange={handleSkipChange}
            placeholder="0"
            min={0}
            fullWidth
          />
          {errors.skip && (
            <p className="text-xs text-rose-600">{errors.skip.message}</p>
          )}
        </div>

        {/* Limit (Take) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Limit (Take)
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Maximum number of items to return)
            </span>
          </label>
          <Input
            type="number"
            {...register("limit", { valueAsNumber: true })}
            value={limit}
            onChange={handleLimitChange}
            placeholder="10"
            min={1}
            fullWidth
          />
          {errors.limit && (
            <p className="text-xs text-rose-600">{errors.limit.message}</p>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-1">
                Range
              </p>
              <p className="text-xl font-bold text-indigo-700">
                {skip} → {skip + limit}
              </p>
            </div>
            <div className="text-center flex-1 border-l-2 border-indigo-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-1">
                Total Items
              </p>
              <p className="text-xl font-bold text-indigo-700">
                {limit}
              </p>
            </div>
          </div>
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

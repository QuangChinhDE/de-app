import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button, Input, Checkbox } from "../../design-system/primitives";
import { TokenizedInput } from "../../components/form-system/TokenizedInput";

interface LoopNodeConfig {
  items: string;
  batchSize: number;
  pauseBetweenBatches: number;
  continueOnError: boolean;
}

const loopSchema = z.object({
  items: z.string().min(1, "Items are required"),
  batchSize: z.number().min(1).max(100),
  pauseBetweenBatches: z.number().min(0),
  continueOnError: z.boolean(),
});

export function LoopForm({ schema, value, onChange, onRun, isRunning, stepOutputs = {} }: NodeFormProps<LoopNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<LoopNodeConfig>({
    resolver: zodResolver(loopSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const items = watch("items");
  const batchSize = watch("batchSize");
  const pauseBetweenBatches = watch("pauseBetweenBatches");
  const continueOnError = watch("continueOnError");

  const handleItemsChange = (newItems: string) => {
    setValue("items", newItems, { shouldValidate: true });
    onChange({ ...value, items: newItems });
  };

  const handleBatchSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value) || 1;
    setValue("batchSize", newSize, { shouldValidate: true });
    onChange({ ...value, batchSize: newSize });
  };

  const handlePauseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPause = parseInt(e.target.value) || 0;
    setValue("pauseBetweenBatches", newPause, { shouldValidate: true });
    onChange({ ...value, pauseBetweenBatches: newPause });
  };

  const handleContinueOnErrorChange = (checked: boolean) => {
    setValue("continueOnError", checked, { shouldValidate: true });
    onChange({ ...value, continueOnError: checked });
  };

  const onSubmit = handleSubmit((data: LoopNodeConfig) => {
    onRun(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Items to Loop Over */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Items to Loop Over
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Array to iterate - each item processed individually)
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

        {/* Batch Size */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Batch Size
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Number of items per batch)
            </span>
          </label>
          <Input
            type="number"
            {...register("batchSize", { valueAsNumber: true })}
            value={batchSize}
            onChange={handleBatchSizeChange}
            placeholder="1"
            min={1}
            max={100}
            fullWidth
          />
          {errors.batchSize && (
            <p className="text-xs text-rose-600">{errors.batchSize.message}</p>
          )}
          <p className="text-xs text-ink-500">
            1 = process one item at a time | Higher = process multiple items in parallel
          </p>
        </div>

        {/* Pause Between Batches */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Pause Between Batches (ms)
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Delay for rate limiting)
            </span>
          </label>
          <Input
            type="number"
            {...register("pauseBetweenBatches", { valueAsNumber: true })}
            value={pauseBetweenBatches}
            onChange={handlePauseChange}
            placeholder="0"
            min={0}
            fullWidth
          />
          {errors.pauseBetweenBatches && (
            <p className="text-xs text-rose-600">{errors.pauseBetweenBatches.message}</p>
          )}
          <p className="text-xs text-ink-500">
            0 = no pause | 1000 = 1 second pause between batches
          </p>
        </div>

        {/* Continue on Error */}
        <div className="space-y-2">
          <Checkbox
            checked={continueOnError}
            onChange={(e) => handleContinueOnErrorChange(e.target.checked)}
            label="Continue on Error"
          />
          <p className="text-xs text-ink-500 ml-6">
            {continueOnError 
              ? "Will continue processing remaining items if one fails" 
              : "Will stop on first error"}
          </p>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-700 mb-2">
            ⚡ Performance Tips
          </p>
          <ul className="space-y-1 text-xs text-amber-600">
            <li>• Small batch size = slower but safer</li>
            <li>• Large batch size = faster but may hit rate limits</li>
            <li>• Add pause to avoid overwhelming APIs</li>
            <li>• Enable "Continue on Error" for resilient loops</li>
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

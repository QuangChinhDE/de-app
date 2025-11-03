import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button, Input, Select } from "../../design-system/primitives";

interface WaitNodeConfig {
  duration: number;
  unit: "ms" | "seconds" | "minutes" | "hours";
}

const waitSchema = z.object({
  duration: z.number().min(0, "Duration must be positive"),
  unit: z.enum(["ms", "seconds", "minutes", "hours"]),
});

export function WaitForm({ schema, value, onChange, onRun, isRunning }: NodeFormProps<WaitNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<WaitNodeConfig>({
    resolver: zodResolver(waitSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const duration = watch("duration");
  const unit = watch("unit");

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseFloat(e.target.value) || 0;
    setValue("duration", newDuration, { shouldValidate: true });
    onChange({ ...value, duration: newDuration });
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value as WaitNodeConfig["unit"];
    setValue("unit", newUnit, { shouldValidate: true });
    onChange({ ...value, unit: newUnit });
  };

  const onSubmit = handleSubmit((data: WaitNodeConfig) => {
    onRun(data);
  });

  // Calculate actual wait time
  const getActualTime = () => {
    const multipliers = { ms: 1, seconds: 1000, minutes: 60000, hours: 3600000 };
    const totalMs = duration * multipliers[unit];
    if (totalMs < 1000) return `${totalMs}ms`;
    if (totalMs < 60000) return `${(totalMs / 1000).toFixed(1)}s`;
    if (totalMs < 3600000) return `${(totalMs / 60000).toFixed(1)}m`;
    return `${(totalMs / 3600000).toFixed(1)}h`;
  };

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Duration
            <span className="ml-2 text-xs font-normal text-ink-500">
              (How long to wait)
            </span>
          </label>
          <Input
            type="number"
            {...register("duration", { valueAsNumber: true })}
            value={duration}
            onChange={handleDurationChange}
            placeholder="1"
            min={0}
            step={0.1}
            fullWidth
          />
          {errors.duration && (
            <p className="text-xs text-rose-600">{errors.duration.message}</p>
          )}
        </div>

        {/* Time Unit */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Time Unit
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Unit of time for duration)
            </span>
          </label>
          <Select
            value={unit}
            onChange={handleUnitChange}
            fullWidth
          >
            <option value="ms">Milliseconds (ms)</option>
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
          </Select>
        </div>

        {/* Preview */}
        <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-1">
              Total Wait Time
            </p>
            <p className="text-3xl font-bold text-indigo-700">
              {getActualTime()}
            </p>
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

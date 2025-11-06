import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button, Input, Select, Checkbox } from "../../design-system/primitives";

interface MergeNodeConfig {
  mode: "append" | "merge" | "join";
  inputCount: number;
  removeDuplicates: boolean;
  mergeStrategy: "last-wins" | "first-wins" | "combine-array";
  joinKey1: string;
  joinKey2: string;
  joinType: "inner" | "left" | "outer";
  flattenJoined: boolean;
}

const mergeSchema = z.object({
  mode: z.enum(["append", "merge", "join"]),
  inputCount: z.number().min(2).max(5),
  removeDuplicates: z.boolean(),
  mergeStrategy: z.enum(["last-wins", "first-wins", "combine-array"]),
  joinKey1: z.string(),
  joinKey2: z.string(),
  joinType: z.enum(["inner", "left", "outer"]),
  flattenJoined: z.boolean(),
});

export function MergeForm({ schema, value, onChange, onRun, isRunning }: NodeFormProps<MergeNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MergeNodeConfig>({
    resolver: zodResolver(mergeSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const mode = watch("mode");
  const inputCount = watch("inputCount");
  const removeDuplicates = watch("removeDuplicates");
  const mergeStrategy = watch("mergeStrategy");
  const joinKey1 = watch("joinKey1");
  const joinKey2 = watch("joinKey2");
  const joinType = watch("joinType");
  const flattenJoined = watch("flattenJoined");

  const handleModeChange = (newMode: MergeNodeConfig["mode"]) => {
    setValue("mode", newMode, { shouldValidate: true });
    onChange({ ...value, mode: newMode });
  };

  const handleChange = (key: keyof MergeNodeConfig, newValue: unknown) => {
    setValue(key, newValue as never, { shouldValidate: true });
    onChange({ ...value, [key]: newValue });
  };

  const onSubmit = handleSubmit((data: MergeNodeConfig) => {
    onRun(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Mode */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Merge Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleModeChange("append")}
              className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all ${
                mode === "append"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300"
              }`}
            >
              📋 Append
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("merge")}
              className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all ${
                mode === "merge"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300"
              }`}
            >
              🔀 Merge
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("join")}
              className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all ${
                mode === "join"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-ink-200 bg-white text-ink-600 hover:border-indigo-300"
              }`}
            >
              🔗 Join
            </button>
          </div>
          <p className="text-xs text-ink-500">
            {mode === "append" && "Combine arrays into one"}
            {mode === "merge" && "Merge objects with conflict resolution"}
            {mode === "join" && "SQL-like join on matching keys"}
          </p>
        </div>

        {/* Input Count (not for JOIN) */}
        {mode !== "join" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink-700">
              Number of Inputs (2-5)
            </label>
            <Input
              type="number"
              value={inputCount}
              onChange={(e) => handleChange("inputCount", parseInt(e.target.value) || 2)}
              min={2}
              max={5}
              fullWidth
            />
            <p className="text-xs text-ink-500">
              Creates {inputCount} input handles on the node
            </p>
          </div>
        )}

        {/* APPEND Mode Options */}
        {mode === "append" && (
          <div className="space-y-2">
            <Checkbox
              checked={removeDuplicates}
              onChange={(e) => handleChange("removeDuplicates", e.target.checked)}
              label="Remove Duplicates"
            />
            <p className="text-xs text-ink-500 ml-6">
              Compares items using JSON.stringify
            </p>
          </div>
        )}

        {/* MERGE Mode Options */}
        {mode === "merge" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink-700">
              Conflict Strategy
            </label>
            <Select
              value={mergeStrategy}
              onChange={(e) => handleChange("mergeStrategy", e.target.value)}
              fullWidth
            >
              <option value="last-wins">Last Wins (Override)</option>
              <option value="first-wins">First Wins (Keep First)</option>
              <option value="combine-array">Combine Array (Collect All)</option>
            </Select>
            <p className="text-xs text-ink-500">
              How to handle duplicate keys when merging objects
            </p>
          </div>
        )}

        {/* JOIN Mode Options */}
        {mode === "join" && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink-700">
                Join Key (Input 1)
              </label>
              <Input
                value={joinKey1}
                onChange={(e) => handleChange("joinKey1", e.target.value)}
                placeholder="id"
                fullWidth
              />
              <p className="text-xs text-ink-500">
                Field name to match in first array
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink-700">
                Join Key (Input 2)
              </label>
              <Input
                value={joinKey2}
                onChange={(e) => handleChange("joinKey2", e.target.value)}
                placeholder="userId"
                fullWidth
              />
              <p className="text-xs text-ink-500">
                Field name to match in second array
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink-700">
                Join Type
              </label>
              <Select
                value={joinType}
                onChange={(e) => handleChange("joinType", e.target.value)}
                fullWidth
              >
                <option value="inner">Inner (Only Matches)</option>
                <option value="left">Left (All from Input 1 + Matches)</option>
                <option value="outer">Outer (All from Both)</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Checkbox
                checked={flattenJoined}
                onChange={(e) => handleChange("flattenJoined", e.target.checked)}
                label="Flatten Result"
              />
              <p className="text-xs text-ink-500 ml-6">
                {flattenJoined 
                  ? "Merge properties into one object" 
                  : "Keep nested {left: ..., right: ...}"}
              </p>
            </div>
          </>
        )}
      </div>
    </form>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button, Textarea } from "../../design-system/primitives";
import { TokenizedInput } from "../../components/form-system/TokenizedInput";

interface CodeNodeConfig {
  code: string;
  inputData: string;
}

const codeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  inputData: z.string(),
});

export function CodeForm({ schema, value, onChange, onRun, isRunning, stepOutputs = {} }: NodeFormProps<CodeNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CodeNodeConfig>({
    resolver: zodResolver(codeSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const code = watch("code");
  const inputData = watch("inputData");

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setValue("code", newCode, { shouldValidate: true });
    onChange({ ...value, code: newCode });
  };

  const handleInputDataChange = (newData: string) => {
    setValue("inputData", newData, { shouldValidate: true });
    onChange({ ...value, inputData: newData });
  };

  const onSubmit = handleSubmit((data: CodeNodeConfig) => {
    onRun(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* JavaScript Code */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            JavaScript Code
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Access input via 'input' variable)
            </span>
          </label>
          <Textarea
            value={code}
            onChange={handleCodeChange}
            placeholder="// Access input via 'input' variable&#10;// Return result&#10;return input.map(item => item.name);"
            rows={12}
            fullWidth
          />
          {errors.code && (
            <p className="text-xs text-rose-600">{errors.code.message}</p>
          )}
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
            <p className="text-xs text-amber-800">
              <strong>💡 Tips:</strong>
            </p>
            <ul className="mt-1 space-y-1 text-xs text-amber-700 list-disc list-inside">
              <li>Access input data via <code className="bg-amber-100 px-1 rounded">input</code> variable</li>
              <li>Must <code className="bg-amber-100 px-1 rounded">return</code> a value</li>
              <li>Can use ES6+ features (map, filter, reduce, etc.)</li>
              <li>Example: <code className="bg-amber-100 px-1 rounded">return input.filter(item =&gt; item.age &gt; 18)</code></li>
            </ul>
          </div>
        </div>

        {/* Input Data */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Input Data (Optional)
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Data to pass to code - auto-uses previous output if empty)
            </span>
          </label>
          <TokenizedInput
            value={inputData}
            onChange={handleInputDataChange}
            onBlur={() => {}}
            placeholder="{{steps.xxx}} or leave empty to use previous output"
            stepOutputs={stepOutputs}
            className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400 font-mono"
          />
          {errors.inputData && (
            <p className="text-xs text-rose-600">{errors.inputData.message}</p>
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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NodeFormProps } from "@node-playground/types";
import { Button, Checkbox } from "../../design-system/primitives";
import { KeyValueEditor } from "../../components/form-system/KeyValueEditor";

interface SetNodeConfig {
  fields: Array<{ key: string; value: string; type?: string }>;
  includeOtherFields: boolean;
}

const setSchema = z.object({
  fields: z.array(
    z.object({
      key: z.string().min(1, "Key is required"),
      value: z.string(),
      type: z.string().optional(),
    })
  ),
  includeOtherFields: z.boolean(),
});

export function SetForm({ schema, value, onChange, onRun, isRunning, stepOutputs = {} }: NodeFormProps<SetNodeConfig>): JSX.Element {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SetNodeConfig>({
    resolver: zodResolver(setSchema),
    defaultValues: value,
    mode: "onBlur",
  });

  const fields = watch("fields");
  const includeOtherFields = watch("includeOtherFields");

  const handleFieldsChange = (newFields: Array<{ key: string; value: string; type?: string; sensitive?: boolean }>) => {
    setValue("fields", newFields, { shouldValidate: true });
    onChange({ ...value, fields: newFields });
  };

  const handleIncludeChange = (checked: boolean) => {
    setValue("includeOtherFields", checked, { shouldValidate: true });
    onChange({ ...value, includeOtherFields: checked });
  };

  const onSubmit = handleSubmit((data: SetNodeConfig) => {
    onRun(data);
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* Fields to Set */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-700">
            Fields to Set
            <span className="ml-2 text-xs font-normal text-ink-500">
              (Set field values - drag from DATA or use static)
            </span>
          </label>
          <KeyValueEditor
            value={fields}
            onChange={handleFieldsChange}
            allowType={true}
            stepOutputs={stepOutputs}
          />
          {errors.fields && (
            <p className="text-xs text-rose-600">{errors.fields.message}</p>
          )}
        </div>

        {/* Include Other Fields */}
        <div className="space-y-2">
          <Checkbox
            checked={includeOtherFields}
            onChange={(e) => handleIncludeChange(e.target.checked)}
            label="Include Other Input Fields"
          />
          <p className="text-xs text-ink-500 ml-6">
            {includeOtherFields 
              ? "Keeps all input fields and adds/updates the fields you set" 
              : "Output will only contain the fields you set"}
          </p>
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

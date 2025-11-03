import { type ChangeEvent } from "react";
import { TokenizedInput } from "./TokenizedInput";

/**
 * KeyValueEditor - COPIED from SchemaForm.tsx
 * Supports key-value pairs with optional type and sensitive masking
 */

export type KeyValueRow = {
  key: string;
  value: string;
  sensitive?: boolean;
  type?: string;
};

export interface KeyValueEditorProps {
  value: KeyValueRow[];
  onChange: (value: KeyValueRow[]) => void;
  allowType?: boolean;
  stepOutputs?: Record<string, unknown>;
}

interface KeyValueRowProps {
  row: KeyValueRow;
  index: number;
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
  allowType?: boolean;
  stepOutputs: Record<string, unknown>;
}

function KeyValueRowComponent({ row, index, rows, onChange, allowType, stepOutputs }: KeyValueRowProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-ink-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Field (drag token)
          </label>
          <input
            type="text"
            value={row.key}
            placeholder="Key"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const updated = [...rows];
              updated[index] = { ...updated[index], key: event.target.value };
              onChange(updated);
            }}
            className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
        
        {allowType && (
          <div className="w-32">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-500">
              Type
            </label>
            <select
              value={row.type ?? "string"}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                const updated = [...rows];
                updated[index] = { ...updated[index], type: event.target.value };
                onChange(updated);
              }}
              className="w-full rounded-md border border-ink-200 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none"
              title="Field Type"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>
        )}
        
        <label className="flex items-center gap-1 self-end pb-1 text-xs text-ink-500">
          <input
            type="checkbox"
            checked={Boolean(row.sensitive)}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const updated = [...rows];
              updated[index] = { ...updated[index], sensitive: event.target.checked };
              onChange(updated);
            }}
            className="h-3 w-3"
          />
          mask
        </label>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-500">
          Value
        </label>
        <TokenizedInput
          value={row.value}
          onChange={(newValue) => {
            const updated = [...rows];
            updated[index] = { ...updated[index], value: newValue };
            onChange(updated);
          }}
          onBlur={() => {}}
          placeholder="Value or drag token"
          stepOutputs={stepOutputs}
          className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            const updated = rows.filter((_, i) => i !== index);
            onChange(updated.length ? updated : [{ key: "", value: "" }]);
          }}
          className="rounded-md bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-100"
        >
          ✕ Remove
        </button>
      </div>
    </div>
  );
}

export function KeyValueEditor({ value, onChange, allowType, stepOutputs = {} }: KeyValueEditorProps): JSX.Element {
  const rows = value.length ? value : [{ key: "", value: "" }];

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <KeyValueRowComponent
          key={index}
          row={row}
          index={index}
          rows={rows}
          onChange={onChange}
          allowType={allowType}
          stepOutputs={stepOutputs}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { key: "", value: "" }])}
        className="rounded-md border border-dashed border-ink-300 px-2 py-1 text-xs text-ink-500 hover:border-ink-400"
      >
        + add row
      </button>
    </div>
  );
}

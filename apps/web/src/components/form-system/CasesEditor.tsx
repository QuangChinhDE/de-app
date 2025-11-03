import { type ChangeEvent } from "react";
import { useDrop } from "react-dnd";
import { DATA_FIELD_ITEM_TYPE, type DataFieldDragItem } from "../DataFieldsPanel";

export interface CasesEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  stepOutputs?: Record<string, unknown>;
}

// Separate component for each case input
interface CaseInputProps {
  caseValue: string;
  index: number;
  cases: string[];
  onChange: (cases: string[]) => void;
}

function CaseInput({ caseValue, index, cases, onChange }: CaseInputProps): JSX.Element {
  const [{ isOver }, dropRef] = useDrop<DataFieldDragItem, void, { isOver: boolean }>(() => ({
    accept: DATA_FIELD_ITEM_TYPE,
    drop: (item: DataFieldDragItem) => {
      const updated = [...cases];
      updated[index] = item.token;
      onChange(updated);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div className="flex gap-2 items-center">
      <div
        ref={dropRef}
        className={`flex-1 relative transition-all ${
          isOver 
            ? "ring-4 ring-indigo-400 rounded-lg bg-indigo-50 p-1" 
            : "hover:ring-2 hover:ring-indigo-200 rounded-lg"
        }`}
      >
        {isOver && (
          <div className="absolute -top-8 left-0 right-0 z-10 flex items-center justify-center">
            <span className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
              ⬇️ DROP HERE
            </span>
          </div>
        )}
        <input
          type="text"
          value={String(caseValue)}
          placeholder={`Case ${index + 1} value (e.g., 200, success) or drag token`}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const updated = [...cases];
            updated[index] = event.target.value;
            onChange(updated);
          }}
          className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400"
        />
      </div>
      <button
        type="button"
        onClick={() => {
          const updated = cases.filter((_, i) => i !== index);
          onChange(updated.length ? updated : [""]);
        }}
        className="rounded-md bg-rose-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 hover:bg-rose-200"
      >
        Remove
      </button>
    </div>
  );
}

export function CasesEditor({ value, onChange }: CasesEditorProps): JSX.Element {
  const cases = value.length ? value : [""];

  return (
    <div className="space-y-2">
      {cases.map((caseValue, index) => (
        <CaseInput
          key={index}
          caseValue={caseValue}
          index={index}
          cases={cases}
          onChange={onChange}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...cases, ""])}
        className="w-full rounded-md border-2 border-dashed border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50"
      >
        + Add Case
      </button>
      <p className="text-xs text-ink-500">
        Each case creates an output handle. Drag tokens from DATA panel or type values manually.
      </p>
    </div>
  );
}

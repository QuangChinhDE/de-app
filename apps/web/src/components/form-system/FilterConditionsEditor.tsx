import { type ChangeEvent } from "react";
import { TokenizedInput } from "./TokenizedInput";

export interface FilterConditionRow {
  field: string;
  fieldType: string;
  operator: string;
  value: string;
}

export interface FilterConditionsEditorProps {
  value: FilterConditionRow[];
  onChange: (value: FilterConditionRow[]) => void;
  stepOutputs?: Record<string, unknown>;
}

interface FilterConditionRowProps {
  row: FilterConditionRow;
  index: number;
  rows: FilterConditionRow[];
  onChange: (rows: FilterConditionRow[]) => void;
  getOperatorsByType: (fieldType: string) => { value: string; label: string }[];
  operatorNeedsValue: (operator: string) => boolean;
  fieldTypes: { value: string; label: string }[];
  stepOutputs: Record<string, unknown>;
}

function FilterConditionRowComponent({
  row,
  index,
  rows,
  onChange,
  getOperatorsByType,
  operatorNeedsValue,
  fieldTypes,
  stepOutputs
}: FilterConditionRowProps): JSX.Element {
  const operators = getOperatorsByType(row.fieldType);
  const needsValue = operatorNeedsValue(row.operator);

  console.log(`[Filter Render] Row ${index}: fieldType=${row.fieldType}, operator=${row.operator}`);
  console.log(`[Filter Render] Available operators:`, operators.map(op => op.value));

  return (
    <div key={`${index}-${row.fieldType}`} className="space-y-2 rounded-lg border-2 border-ink-200 bg-ink-50 p-3">
      {/* Row 1: Field, Type, Operator, Delete button */}
      <div className="grid grid-cols-12 gap-2 items-start">
        <div className="col-span-5">
          <label className="block text-[10px] font-semibold text-ink-600 mb-1">Field (drag token)</label>
          <TokenizedInput
            value={row.field}
            onChange={(newValue) => {
              const updated = [...rows];
              updated[index] = { ...updated[index], field: newValue };
              onChange(updated);
            }}
            onBlur={() => {}}
            placeholder="{{steps.manual1.field}}"
            stepOutputs={stepOutputs}
            className="w-full rounded-md border border-ink-200 px-2 py-2 text-sm focus:border-indigo-400"
          />
        </div>

        <div className="col-span-3">
          <label className="block text-[10px] font-semibold text-ink-600 mb-1">Type</label>
          <select
            value={row.fieldType}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              const newType = event.target.value;
              const newOperators = getOperatorsByType(newType);
              const newOperator = newOperators[0]?.value || "";
              
              console.log(`[Filter] Type changed from ${row.fieldType} to ${newType}`);
              console.log(`[Filter] Old operator: ${row.operator}, New operator: ${newOperator}`);
              console.log(`[Filter] Available operators:`, newOperators.map(op => op.value));
              
              // Create completely new array to force React update
              const updated = rows.map((r, i) => {
                if (i === index) {
                  return {
                    field: r.field,
                    fieldType: newType,
                    operator: newOperator,
                    value: operatorNeedsValue(newOperator) ? r.value : ""
                  };
                }
                return { ...r };
              });
              
              onChange(updated);
            }}
            className="w-full rounded-md border border-ink-200 px-2 py-2 text-xs focus:border-indigo-400"
            title="Field Type"
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-3">
          <label className="block text-[10px] font-semibold text-ink-600 mb-1">Operator</label>
          <select
            key={`operator-${index}-${row.fieldType}`}
            value={row.operator}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              const updated = [...rows];
              updated[index] = { ...updated[index], operator: event.target.value };
              onChange(updated);
            }}
            className="w-full rounded-md border border-ink-200 px-2 py-2 text-xs focus:border-indigo-400"
            title="Operator"
            disabled={!row.fieldType || operators.length === 0}
          >
            {operators.length === 0 ? (
              <option value="">-- Select Type first --</option>
            ) : (
              <>
                <option value="">-- Select Operator --</option>
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className="col-span-1 flex justify-end pt-5">
          <button
            type="button"
            onClick={() => {
              const updated = rows.filter((_, i) => i !== index);
              onChange(updated.length ? updated : [{ field: "", fieldType: "", operator: "", value: "" }]);
            }}
            className="text-rose-500 hover:text-rose-600 text-xl"
            title="Remove condition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Row 2: Value input full width */}
      <div>
        <label className="block text-[10px] font-semibold text-ink-600 mb-1">Value</label>
        <TokenizedInput
          value={row.value}
          onChange={(newValue) => {
            const updated = [...rows];
            updated[index] = { ...updated[index], value: newValue };
            onChange(updated);
          }}
          onBlur={() => {}}
          placeholder={!row.operator ? "Select operator first" : needsValue ? `Enter ${row.fieldType || 'value'} or drag token` : "No value needed for this operator"}
          stepOutputs={stepOutputs}
          className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-indigo-400"
        />
      </div>
    </div>
  );
}

export function FilterConditionsEditor({ value, onChange, stepOutputs = {} }: FilterConditionsEditorProps): JSX.Element {
  // Ensure we have proper filter structure - if empty or invalid, create default
  let rows = value;
  if (!Array.isArray(rows) || rows.length === 0) {
    rows = [{ field: "", fieldType: "", operator: "", value: "" }];
  }
  
  // Fix any rows that might be missing required fields
  rows = rows.map(row => ({
    field: row.field || "",
    fieldType: row.fieldType || "", 
    operator: row.operator || "",
    value: row.value || ""
  }));

  const fieldTypes = [
    { value: "", label: "-- Select Type --" },
    { value: "string", label: "String" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "date", label: "Date & Time" },
    { value: "array", label: "Array" },
    { value: "object", label: "Object" },
  ];

  const getOperatorsByType = (fieldType: string): { value: string; label: string }[] => {
    // Return empty array if no type selected
    if (!fieldType) {
      return [];
    }
    
    switch (fieldType) {
      case "string":
        return [
          { value: "is equal to", label: "is equal to" },
          { value: "is not equal to", label: "is not equal to" },
          { value: "contains", label: "contains" },
          { value: "does not contain", label: "does not contain" },
          { value: "starts with", label: "starts with" },
          { value: "does not start with", label: "does not start with" },
          { value: "ends with", label: "ends with" },
          { value: "does not end with", label: "does not end with" },
          { value: "matches regex", label: "matches regex" },
          { value: "does not match regex", label: "does not match regex" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
        ];
      case "number":
        return [
          { value: "is equal to", label: "is equal to" },
          { value: "is not equal to", label: "is not equal to" },
          { value: "is greater than", label: "is greater than" },
          { value: "is less than", label: "is less than" },
          { value: "is greater than or equal to", label: "is greater than or equal to" },
          { value: "is less than or equal to", label: "is less than or equal to" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
        ];
      case "boolean":
        return [
          { value: "is true", label: "is true" },
          { value: "is false", label: "is false" },
          { value: "is equal to", label: "is equal to" },
          { value: "is not equal to", label: "is not equal to" },
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
        ];
      case "date":
        return [
          { value: "is equal to", label: "is equal to" },
          { value: "is not equal to", label: "is not equal to" },
          { value: "is after", label: "is after" },
          { value: "is before", label: "is before" },
          { value: "is after or equal to", label: "is after or equal to" },
          { value: "is before or equal to", label: "is before or equal to" },
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
        ];
      case "array":
        return [
          { value: "contains", label: "contains" },
          { value: "does not contain", label: "does not contain" },
          { value: "length equal to", label: "length equal to" },
          { value: "length not equal to", label: "length not equal to" },
          { value: "length greater than", label: "length greater than" },
          { value: "length less than", label: "length less than" },
          { value: "length greater than or equal to", label: "length greater than or equal to" },
          { value: "length less than or equal to", label: "length less than or equal to" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
        ];
      default:
        return [
          { value: "exists", label: "exists" },
          { value: "does not exist", label: "does not exist" },
          { value: "is empty", label: "is empty" },
          { value: "is not empty", label: "is not empty" },
        ];
    }
  };

  // Check if operator needs value input
  const operatorNeedsValue = (operator: string): boolean => {
    const noValueOps = ["is empty", "is not empty", "exists", "does not exist", "is true", "is false"];
    return !noValueOps.includes(operator);
  };

  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <FilterConditionRowComponent
          key={`${index}-${row.fieldType}`}
          row={row}
          index={index}
          rows={rows}
          onChange={onChange}
          getOperatorsByType={getOperatorsByType}
          operatorNeedsValue={operatorNeedsValue}
          fieldTypes={fieldTypes}
          stepOutputs={stepOutputs}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { field: "", fieldType: "", operator: "", value: "" }])}
        className="w-full rounded-md border-2 border-dashed border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50"
      >
        + Add Condition
      </button>
      <p className="text-xs text-ink-500">
        Drag fields from DATA panel → Select type → Choose operator → Set value (if needed)
      </p>
    </div>
  );
}

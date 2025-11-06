import { useState, useEffect } from "react";
import type { AdvancedOptions } from "../../../../packages/types/src";
import { Input } from "../design-system/primitives/Input";
import { Checkbox } from "../design-system/primitives/Checkbox";
import { Select } from "../design-system/primitives/Select";

interface AdvancedOptionsTabProps {
  value?: AdvancedOptions;
  onChange: (value: AdvancedOptions) => void;
}

export function AdvancedOptionsTab({ value, onChange }: AdvancedOptionsTabProps) {
  const [wait, setWait] = useState<AdvancedOptions["wait"]>(
    value?.wait || { enabled: false, duration: 1000 }
  );
  const [sort, setSort] = useState<AdvancedOptions["sort"]>(
    value?.sort || { enabled: false, field: "", order: "asc" }
  );
  const [limit, setLimit] = useState<AdvancedOptions["limit"]>(
    value?.limit || { enabled: false, skip: 0, take: 100 }
  );

  useEffect(() => {
    onChange({ wait, sort, limit });
  }, [wait, sort, limit]);

  return (
    <div className="space-y-6 p-6 overflow-y-auto h-full bg-gray-50">
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          ⚙️ Advanced Options
        </h3>
        <p className="text-xs text-gray-500">
          Post-processing operations applied after node execution
        </p>
      </div>

      {/* Wait Section */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={wait?.enabled || false}
            onChange={(e) =>
              setWait((prev) => ({ ...prev!, enabled: e.target.checked }))
            }
          />
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-800">
              ⏱️ Wait (Delay Execution)
            </label>
            <p className="text-xs text-gray-500">
              Pause before sending output to next node
            </p>
          </div>
        </div>

        {wait?.enabled && (
          <div className="ml-7 space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Duration (milliseconds)
            </label>
            <Input
              type="number"
              value={wait.duration}
              onChange={(e) =>
                setWait((prev) => ({
                  ...prev!,
                  duration: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="1000"
              min={0}
            />
            <p className="text-xs text-gray-500">
              {wait.duration >= 1000
                ? `${(wait.duration / 1000).toFixed(1)} seconds`
                : `${wait.duration} ms`}
            </p>
          </div>
        )}
      </div>

      {/* Sort Section */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={sort?.enabled || false}
            onChange={(e) =>
              setSort((prev) => ({ ...prev!, enabled: e.target.checked }))
            }
          />
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-800">
              ↕️ Sort Results
            </label>
            <p className="text-xs text-gray-500">
              Sort output items by a field value
            </p>
          </div>
        </div>

        {sort?.enabled && (
          <div className="ml-7 space-y-3">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Field Name
              </label>
              <Input
                type="text"
                value={sort.field}
                onChange={(e) =>
                  setSort((prev) => ({ ...prev!, field: e.target.value }))
                }
                placeholder="name"
              />
              <p className="text-xs text-gray-500">
                Use dot notation for nested fields (e.g., "user.name")
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Sort Order
              </label>
              <Select
                value={sort.order}
                onChange={(e) =>
                  setSort((prev) => ({ ...prev!, order: e.target.value as "asc" | "desc" }))
                }
              >
                <option value="asc">⬆️ Ascending (A → Z, 0 → 9)</option>
                <option value="desc">⬇️ Descending (Z → A, 9 → 0)</option>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Limit Section */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={limit?.enabled || false}
            onChange={(e) =>
              setLimit((prev) => ({ ...prev!, enabled: e.target.checked }))
            }
          />
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-800">
              #️⃣ Limit Results
            </label>
            <p className="text-xs text-gray-500">
              Control how many items to output
            </p>
          </div>
        </div>

        {limit?.enabled && (
          <div className="ml-7 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Skip (Offset)
              </label>
              <Input
                type="number"
                value={limit.skip}
                onChange={(e) =>
                  setLimit((prev) => ({
                    ...prev!,
                    skip: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                min={0}
              />
              <p className="text-xs text-gray-500">Start from item N</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Take (Max Items)
              </label>
              <Input
                type="number"
                value={limit.take}
                onChange={(e) =>
                  setLimit((prev) => ({
                    ...prev!,
                    take: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="100"
                min={1}
              />
              <p className="text-xs text-gray-500">Max items to output</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> These options are applied in order: Wait → Sort → Limit
        </p>
      </div>
    </div>
  );
}

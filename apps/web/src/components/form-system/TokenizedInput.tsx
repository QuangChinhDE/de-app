import { useMemo, useState } from "react";
import { useDrop } from "react-dnd";
import { DATA_FIELD_ITEM_TYPE, type DataFieldDragItem } from "../DataFieldsPanel";

/**
 * TokenizedInput - COPIED from SchemaForm.tsx
 * Shows tokens as inline chips with preview on hover
 * Supports drag-drop from DataFieldsPanel
 */

interface TokenizedInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  stepOutputs: Record<string, unknown>;
  className?: string;
}

// Helper: Extract tokens from string
function extractTokens(value: string): Array<{ token: string; path: string }> {
  const regex = /{{([^}]+)}}/g;
  const matches: Array<{ token: string; path: string }> = [];
  let match;
  while ((match = regex.exec(value)) !== null) {
    matches.push({ token: match[0], path: match[1] });
  }
  return matches;
}

// Helper: Get preview value for a token path
function getPreviewValue(path: string, stepOutputs: Record<string, unknown>): unknown {
  const cleanPath = path.startsWith('steps.') ? path.slice(6) : path;
  const parts = cleanPath.split('.');
  let current: any = stepOutputs;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}

export function TokenizedInput({ 
  value, 
  onChange, 
  onBlur, 
  placeholder, 
  stepOutputs, 
  className 
}: TokenizedInputProps): JSX.Element {
  const [{ isOver }, dropRef] = useDrop<DataFieldDragItem, void, { isOver: boolean }>(() => ({
    accept: DATA_FIELD_ITEM_TYPE,
    drop: (item: DataFieldDragItem) => {
      const currentValue = value || "";
      const newValue = currentValue.length > 0 ? `${currentValue} ${item.token}` : item.token;
      onChange(newValue);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver() && !monitor.didDrop(),
    }),
  }), [value, onChange]);

  // Parse value into parts: text and tokens
  const parts = useMemo(() => {
    const result: Array<{ type: 'text' | 'token'; content: string; path?: string }> = [];
    const regex = /{{([^}]+)}}/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(value)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: value.substring(lastIndex, match.index) });
      }
      result.push({ type: 'token', content: match[0], path: match[1] });
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < value.length) {
      result.push({ type: 'text', content: value.substring(lastIndex) });
    }
    
    return result;
  }, [value]);

  const [isEditing, setIsEditing] = useState(false);
  const hasTokens = parts.some((p) => p.type === 'token');

  const removeToken = (tokenToRemove: string) => {
    const newValue = value.replace(tokenToRemove, '');
    onChange(newValue);
  };

  return (
    <div ref={dropRef} className="flex flex-col gap-2">
      {!isEditing && hasTokens ? (
        <div
          className={`flex min-h-[42px] flex-wrap items-center gap-1 rounded-md border px-3 py-2 transition-all ${
            isOver 
              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300" 
              : "border-ink-200 bg-white"
          }`}
        >
          {parts.map((part, index) => {
            if (part.type === 'token') {
              const previewValue = part.path ? getPreviewValue(part.path, stepOutputs) : undefined;
              return (
                <div
                  key={index}
                  className="group relative inline-flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-mono text-white shadow-sm"
                  title={part.content}
                >
                  <span className="select-none font-bold">{part.content}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeToken(part.content);
                    }}
                    className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
                    title="Remove token"
                  >
                    ✕
                  </button>
                  <div className="pointer-events-none absolute bottom-full left-0 z-[999] mb-2 hidden w-max max-w-sm rounded-lg border-2 border-emerald-400 bg-emerald-50 p-3 shadow-xl group-hover:block">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Preview Value:</div>
                    <div className="max-h-48 overflow-auto rounded border border-emerald-200 bg-white p-2 font-mono text-xs text-emerald-900">
                      {previewValue !== undefined 
                        ? (typeof previewValue === 'object'
                            ? JSON.stringify(previewValue, null, 2)
                            : String(previewValue))
                        : (
                          <div className="space-y-1">
                            <span className="block italic text-red-600">⚠️ No data available</span>
                            <div className="text-[9px] text-gray-500">
                              <div>Token: {part.content}</div>
                              <div>Path: {part.path}</div>
                            </div>
                          </div>
                        )
                      }
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <span 
                  key={index} 
                  className="cursor-text text-sm text-ink-700"
                  onClick={() => setIsEditing(true)}
                >
                  {part.content}
                </span>
              );
            }
          })}
          {parts.length === 0 && (
            <span className="text-sm text-ink-400">{placeholder}</span>
          )}
          
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="ml-auto flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-200"
            title="Edit raw value"
          >
            ✏️ Edit
          </button>
        </div>
      ) : (
        <div className="relative">
          {isOver && (
            <div className="absolute -top-8 left-0 right-0 z-10 flex items-center justify-center">
              <span className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
                ⬇️ DROP HERE
              </span>
            </div>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              onBlur();
            }}
            onFocus={() => setIsEditing(true)}
            placeholder={placeholder}
            className={className}
            autoFocus={isEditing}
          />
        </div>
      )}
      
      {hasTokens && !isEditing && (
        <div className="text-[10px] text-ink-500">
          💡 Hover chip for preview • Click "Edit" to modify
        </div>
      )}
    </div>
  );
}

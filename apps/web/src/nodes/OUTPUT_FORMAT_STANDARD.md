# Node Output Format Standard

## Overview
All nodes must follow a standardized output format to ensure consistent data flow and token resolution.

## Single Output Nodes (Default)

Most nodes return a single output:

```typescript
interface NodeRuntimeResult {
  output: unknown; // Array, Object, or primitive value
  status?: 'success' | 'error';
  durationMs?: number;
}
```

**Examples:**
- MANUAL: `{ output: [{ id: 1, name: 'Alice' }] }`
- SET: `{ output: [{ id: 1, fullName: 'Alice Smith' }] }`
- FILTER: `{ output: [{ id: 1, status: 'active' }] }`
- HTTP: `{ output: { data: {...}, status: 200 } }`
- AGGREGATE: `{ output: { total: 100, average: 50 } }`

## Multiple Output Nodes (Branching)

Nodes with conditional branching (IF, SWITCH) return multiple labeled outputs:

```typescript
interface NodeRuntimeResult {
  outputs: Array<{
    label: string;  // Branch identifier: 'TRUE', 'FALSE', 'case_0', 'default'
    data: unknown;  // Data for this branch (usually array)
  }>;
  status?: 'success' | 'error';
  durationMs?: number;
}
```

**Examples:**

### IF Node:
```typescript
{
  outputs: [
    { label: 'TRUE', data: [{ id: 1, age: 25 }] },
    { label: 'FALSE', data: [{ id: 2, age: 35 }] }
  ]
}
```

### SWITCH Node:
```typescript
{
  outputs: [
    { label: 'case_0', data: [{ status: 'active' }] },
    { label: 'case_1', data: [{ status: 'pending' }] },
    { label: 'default', data: [{ status: 'other' }] }
  ]
}
```

## Flow Store Processing

### Single Output:
- Stored as: `stepOutputs[nodeKey] = output`
- Token: `{{steps.nodeKey.field}}`

### Multiple Outputs:
- Stored as: `stepOutputs[nodeKey-label] = data` for each branch
- Example: `stepOutputs['if-TRUE']`, `stepOutputs['if-FALSE']`
- Token: `{{steps.if-TRUE.field}}`, `{{steps.if-FALSE.field}}`
- **Note**: Main key (`stepOutputs['if']`) does NOT exist!

## Migration Checklist

- [x] IF node - Use `outputs` format
- [ ] SWITCH node - Already uses `outputs` format ✅
- [ ] Other nodes - Verify single `output` format

## Benefits

1. **Consistent token resolution**: All nodes use same pattern
2. **Type safety**: Clear distinction between single/multiple outputs
3. **UI rendering**: ResultPanel can detect output type automatically
4. **Edge metadata**: `sourceHandle` correctly identifies branches

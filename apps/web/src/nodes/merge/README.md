# 🔀 MERGE Node

Combines data from multiple sources with different strategies.

## 📋 Modes

### 1. **APPEND Mode** - Concatenate Arrays
Combine multiple arrays into one long array.

**Use Cases:**
- Merge results from multiple API calls
- Combine filtered data from different branches
- Aggregate data from parallel workflows

**Configuration:**
- `Input 1-4`: Arrays to concatenate (use tokens like `{{steps.xxx}}`)
- `Remove Duplicates`: Optional deduplication by JSON comparison

**Example:**
```
Input 1: [{"id": 1}, {"id": 2}]
Input 2: [{"id": 3}, {"id": 4}]
Output:  [{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}]
```

---

### 2. **MERGE Mode** - Combine Object Properties
Merge properties from multiple objects into one.

**Use Cases:**
- Combine user profile from different sources
- Merge configuration objects
- Aggregate metadata from multiple steps

**Configuration:**
- `Input 1-4`: Objects to merge
- `Conflict Strategy`:
  - **Last Wins**: Later inputs override earlier ones
  - **First Wins**: Keep value from first input
  - **Combine as Array**: Collect all values into array

**Example:**
```
Input 1: {"name": "Alice", "age": 25}
Input 2: {"age": 30, "city": "NYC"}

Last Wins:  {"name": "Alice", "age": 30, "city": "NYC"}
First Wins: {"name": "Alice", "age": 25, "city": "NYC"}
Array:      {"name": "Alice", "age": [25, 30], "city": "NYC"}
```

---

### 3. **JOIN Mode** - SQL-like Join on Key
Join two arrays by matching field (like SQL JOIN).

**Use Cases:**
- Join users with their orders
- Match products with inventory
- Combine related data from different sources

**Configuration:**
- `Input 1`: Left array
- `Input 2`: Right array
- `Join Key (Input 1)`: Field name in left array (e.g., "userId")
- `Join Key (Input 2)`: Field name in right array (e.g., "id")
- `Join Type`:
  - **Inner**: Only matching records
  - **Left**: All from left + matching from right
  - **Outer**: All records from both sides
- `Flatten Joined Objects`: Merge properties (vs nested structure)

**Example - Inner Join:**
```
Input 1 (users):
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob"}
]

Input 2 (orders):
[
  {"userId": 1, "orderId": 101, "total": 50},
  {"userId": 1, "orderId": 102, "total": 75},
  {"userId": 3, "orderId": 103, "total": 100}
]

Join on: id = userId (Inner)
Flatten: true

Output:
[
  {"id": 1, "name": "Alice", "userId": 1, "orderId": 101, "total": 50},
  {"id": 1, "name": "Alice", "userId": 1, "orderId": 102, "total": 75}
]
```

**Example - Left Join:**
```
Same inputs as above, but Join Type = "left"

Output:
[
  {"id": 1, "name": "Alice", "userId": 1, "orderId": 101, "total": 50},
  {"id": 1, "name": "Alice", "userId": 1, "orderId": 102, "total": 75},
  {"id": 2, "name": "Bob"}  // No matching order, but included
]
```

---

## 🔗 Common Workflows

### Workflow 1: Merge Parallel API Results
```
                    ┌─→ HTTP (API 1) ─┐
Manual (trigger) ─→ │                  ├─→ MERGE (append) ─→ Process
                    └─→ HTTP (API 2) ─┘
```

### Workflow 2: Enrich Data with JOIN
```
HTTP (get users) ─→ MERGE (join) ←─ HTTP (get orders)
                         ↓
                    Process enriched data
```

### Workflow 3: Combine Branch Results
```
                    ┌─→ case_0 ─→ SET ─┐
SWITCH (by status) ─┤                   ├─→ MERGE (append) ─→ Output
                    └─→ case_1 ─→ SET ─┘
```

### Workflow 4: Merge Metadata
```
HTTP (API call) ─→ SET (add timestamp) ─→ MERGE (merge) ←─ Manual (config)
                                              ↓
                                       Combined object with metadata
```

---

## 💡 Tips

### Auto-use Previous Output
If `Input 1` is empty, MERGE automatically uses the previous node's output:
```
HTTP ─→ MERGE (Input 1 empty, Input 2 = {{steps.xxx}})
        ↓
      Auto-uses HTTP output as Input 1
```

### Smart Unwrap
MERGE automatically unwraps SWITCH/IF outputs:
```
SWITCH ─→ MERGE
  {case_0: [...], case_1: [...]}
            ↓
  Auto-extracts first non-empty case
```

### Remove Duplicates
Use `Remove Duplicates` in APPEND mode to avoid duplicate items:
```
Input 1: [{"id": 1}, {"id": 2}]
Input 2: [{"id": 2}, {"id": 3}]

Without: [{"id": 1}, {"id": 2}, {"id": 2}, {"id": 3}]
With:    [{"id": 1}, {"id": 2}, {"id": 3}]
```

### Nested Join Output
Set `Flatten Joined Objects = false` to keep left/right separate:
```
Output:
[
  {
    "left": {"id": 1, "name": "Alice"},
    "right": {"userId": 1, "orderId": 101}
  }
]
```

---

## ⚠️ Common Errors

### Error: "MERGE requires at least 2 inputs"
**Cause:** Less than 2 inputs provided
**Fix:** Provide at least 2 inputs using tokens like `{{steps.xxx}}`

### Error: "APPEND mode requires all inputs to be arrays"
**Cause:** One of the inputs is not an array
**Fix:** Use SPLIT node to extract arrays first, or use MERGE mode for objects

### Error: "JOIN mode requires exactly 2 inputs"
**Cause:** JOIN mode only supports 2 arrays
**Fix:** For more than 2 arrays, use multiple MERGE nodes or APPEND mode

### Error: "JOIN mode requires both inputs to be arrays"
**Cause:** One or both inputs are not arrays
**Fix:** Ensure both inputs are arrays of objects with the join key field

---

## 🎯 Best Practices

1. **Use APPEND for arrays, MERGE for objects**
   - Don't try to append objects or merge arrays

2. **Specify join keys carefully**
   - Ensure the key field exists in all objects
   - Use consistent naming (e.g., "id" vs "userId")

3. **Choose correct join type**
   - Inner: Only want matching records
   - Left: Want all from first source + matches
   - Outer: Want everything from both sources

4. **Remove duplicates in APPEND**
   - Useful when merging filtered results that might overlap

5. **Use flatten in JOIN**
   - Easier to work with flat objects downstream
   - Use nested structure only if you need to distinguish left/right

6. **Chain multiple MERGE nodes**
   - For more than 4 inputs in APPEND mode
   - For complex multi-source joins

---

## 📊 Performance

- **APPEND**: O(n) where n = total items across all arrays
- **MERGE**: O(k) where k = total number of keys
- **JOIN**: O(n + m) where n, m = sizes of input arrays

**Optimization Tips:**
- For large datasets, use JOIN with indexed fields
- Remove duplicates only when necessary
- Use inner join to reduce result size

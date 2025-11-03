# 🔄 LOOP OVER ITEMS Node

Iterate over an array and process each item individually.

## 🎨 UI Components (Custom Form)

**Form Component**: `LoopForm.tsx` (~180 lines)

**Features**:
- ✅ TokenizedInput cho items array
- ✅ BatchSize number input (1-100)
- ✅ PauseBetweenBatches milliseconds input
- ✅ ContinueOnError checkbox
- ✅ Performance tips box với amber color
- ✅ Info box với batch size trade-offs và rate limiting advice

**Dependencies**:
- React Hook Form + Zod validation
- Design system primitives (Input, Button, Checkbox)
- TokenizedInput component

## 📋 Overview

The Loop node takes an array and processes each item one by one (or in batches). This is essential for:
- Processing items sequentially with rate limiting
- Executing complex operations on each item
- Batch processing with delays
- Handling errors gracefully for individual items

## 🎯 Use Cases

### 1. **Process Each Order Individually**
```
HTTP (get orders) → LOOP → HTTP (process each order) → Collect results
```

### 2. **Send Email to Each User**
```
Filter (active users) → LOOP → HTTP (send email API) → Track sent emails
```

### 3. **Rate-Limited API Calls**
```
Manual (100 items) → LOOP (batch=10, pause=1000ms) → HTTP (external API)
```

### 4. **Transform Each Item with Complex Logic**
```
SPLIT → LOOP → IF (condition) → SET (transform) → MERGE results
```

---

## 🔧 Configuration

### **Items to Loop Over**
- **Type:** Array (required)
- **Input:** Token like `{{steps.xxx}}` or previous output
- **Example:** `{{steps.http1.body.orders}}`

### **Batch Size**
- **Type:** Number (1-100)
- **Default:** 1 (process one item at a time)
- **Example:** 10 (process 10 items per batch)
- **Use:** Group items for parallel processing or rate limiting

### **Pause Between Batches (ms)**
- **Type:** Number (milliseconds)
- **Default:** 0 (no pause)
- **Example:** 1000 (wait 1 second between batches)
- **Use:** Rate limiting for external APIs

### **Continue on Error**
- **Type:** Boolean
- **Default:** false (stop on first error)
- **Use:** Set to true to process all items even if some fail

---

## 📤 Output Structure

```json
{
  "items": [...],           // Array of processed items
  "successCount": 95,       // Number of successfully processed items
  "errorCount": 5,          // Number of failed items
  "totalCount": 100,        // Total number of items
  "batches": [              // Batch information
    {
      "batchIndex": 1,
      "itemCount": 10,
      "items": [...]
    },
    ...
  ]
}
```

---

## 💡 Common Workflows

### Workflow 1: Sequential Processing
```
Manual (array) → LOOP (batch=1) → HTTP → Collect results
```
**Use:** Process each item one by one, wait for each to complete

### Workflow 2: Batch Processing
```
HTTP (get 1000 items) → LOOP (batch=50, pause=2000) → HTTP → Results
```
**Use:** Process 50 items at a time, pause 2s between batches (rate limiting)

### Workflow 3: Parallel Processing
```
HTTP → LOOP (batch=20) → HTTP (20 concurrent calls) → Aggregate
```
**Use:** Process multiple items simultaneously for speed

### Workflow 4: Error Handling
```
Filter → LOOP (continueOnError=true) → HTTP → Check errors
```
**Use:** Process all items even if some fail, then analyze errors

### Workflow 5: Complex Transform
```
SPLIT → LOOP → IF → SWITCH → SET → MERGE final results
```
**Use:** Each item goes through complex decision tree

---

## 🎨 Examples

### Example 1: Process Orders
```
Input (from previous node):
[
  {"orderId": 1, "amount": 100},
  {"orderId": 2, "amount": 200},
  {"orderId": 3, "amount": 150}
]

Configuration:
- Items: {{steps.http1.body.orders}}
- Batch Size: 1
- Pause: 0ms
- Continue on Error: false

Output:
{
  "items": [
    {"orderId": 1, "amount": 100},
    {"orderId": 2, "amount": 200},
    {"orderId": 3, "amount": 150}
  ],
  "successCount": 3,
  "errorCount": 0,
  "totalCount": 3,
  "batches": [
    {"batchIndex": 1, "itemCount": 1, "items": [{"orderId": 1, ...}]},
    {"batchIndex": 2, "itemCount": 1, "items": [{"orderId": 2, ...}]},
    {"batchIndex": 3, "itemCount": 1, "items": [{"orderId": 3, ...}]}
  ]
}
```

### Example 2: Batch with Rate Limiting
```
Input:
[user1, user2, user3, ..., user50]  // 50 users

Configuration:
- Items: {{steps.filter1}}
- Batch Size: 10
- Pause: 1000ms (1 second)
- Continue on Error: true

Processing:
- Batch 1: Process users 1-10
- Wait 1 second
- Batch 2: Process users 11-20
- Wait 1 second
- ... (5 batches total)

Output:
{
  "items": [50 users],
  "successCount": 48,
  "errorCount": 2,
  "totalCount": 50,
  "batches": [
    {"batchIndex": 1, "itemCount": 10, "items": [...]},
    {"batchIndex": 2, "itemCount": 10, "items": [...]},
    {"batchIndex": 3, "itemCount": 10, "items": [...]},
    {"batchIndex": 4, "itemCount": 10, "items": [...]},
    {"batchIndex": 5, "itemCount": 10, "items": [...]}
  ]
}
```

---

## 🔍 How It Works

### Sequential Processing (Batch Size = 1)
```
Items: [A, B, C, D]
Batch Size: 1

Execution:
1. Process A → complete
2. Process B → complete
3. Process C → complete
4. Process D → complete
```

### Batch Processing (Batch Size = 2)
```
Items: [A, B, C, D, E, F]
Batch Size: 2
Pause: 500ms

Execution:
1. Process [A, B] together
2. Wait 500ms
3. Process [C, D] together
4. Wait 500ms
5. Process [E, F] together
```

---

## ⚠️ Common Errors

### Error: "LOOP requires an array input"
**Cause:** Input is not an array (object, string, or null)
**Fix:** 
- Ensure input is an array: `{{steps.xxx}}`
- Use SPLIT node first to extract array from object
- Check previous node output in Result tab

### Error: "Empty array provided"
**Cause:** Input array has no items
**Fix:** 
- Check filter/previous node didn't remove all items
- Add IF node to check array length before looping

### Error: "LOOP failed at item X/Y"
**Cause:** Processing failed for an item and continueOnError=false
**Fix:**
- Set continueOnError=true to process all items
- Add error handling in downstream nodes
- Check console logs to see which item failed

---

## 💡 Tips & Best Practices

### 1. **Use Batch Size for Performance**
```
❌ Bad: Loop over 1000 items with batch=1 (slow, 1000 sequential operations)
✅ Good: Loop with batch=50 (faster, 20 batches of 50)
```

### 2. **Rate Limiting for External APIs**
```
✅ Good practice:
- Batch Size: 10
- Pause: 1000ms
- Result: 10 API calls per second (respects rate limits)
```

### 3. **Continue on Error for Resilience**
```
✅ Set continueOnError=true when:
- Processing large datasets
- External API might fail occasionally
- You want to see all errors at the end
```

### 4. **Auto-use Previous Output**
```
HTTP → LOOP (items empty) → Auto-uses HTTP output
           ↓
    Automatically detects array from previous node
```

### 5. **Smart Unwrap**
```
SWITCH → LOOP
  {case_0: [...], case_1: [...]}
            ↓
  Auto-extracts first non-empty case array
```

---

## 🎯 When to Use LOOP vs Other Nodes

### Use LOOP when:
✅ Need to process each item **individually** with delays
✅ Rate limiting required (API throttling)
✅ Sequential processing (one after another)
✅ Complex per-item logic (IF/SWITCH per item)

### Use FILTER when:
✅ Just need to **remove** items based on conditions
✅ No need to process each item separately

### Use SPLIT when:
✅ Just need to **extract fields** from each item
✅ Simple field transformation

### Use MAP (if existed) when:
✅ Need to **transform** each item (not yet implemented)

---

## 📊 Performance

### Sequential (Batch Size = 1)
- **Speed:** Slowest (one item at a time)
- **Safety:** Safest (no concurrent issues)
- **Use:** External APIs with strict rate limits

### Small Batches (5-10)
- **Speed:** Moderate
- **Safety:** Good balance
- **Use:** Most common use case

### Large Batches (50-100)
- **Speed:** Fastest
- **Safety:** Risk of overwhelming external services
- **Use:** Internal processing, no rate limits

---

## 🚀 Advanced Patterns

### Pattern 1: Conditional Loop
```
Filter (only active) → LOOP → IF (amount > 100) → High value processing
                                    ↓
                              Low value processing
```

### Pattern 2: Loop with Retry
```
HTTP (get items) → LOOP → HTTP (try process) → IF (failed) → Retry queue
                                                      ↓
                                                  Success queue
```

### Pattern 3: Nested Processing
```
LOOP (customers) → LOOP (orders per customer) → Process each order
```

### Pattern 4: Progress Tracking
```
LOOP → SET (add processed timestamp) → MERGE → Track completion rate
```

---

## 🔗 Integration with Other Nodes

### With HTTP Node
```
LOOP → HTTP (API call per item) → Collect responses
```

### With IF Node
```
LOOP → IF (condition per item) → Branch processing
```

### With SWITCH Node
```
LOOP → SWITCH (route per item) → Different handlers
```

### With SET Node
```
LOOP → SET (add metadata per item) → Enriched items
```

### With MERGE Node
```
LOOP → Process → MERGE (combine results) → Final output
```

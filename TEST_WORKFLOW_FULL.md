# Full Workflow Test Case

## 🎯 Objective
Test ALL nodes (7 nodes) trong một workflow phức tạp với nhiều data types và edge cases.

## 📊 Test Data

### Input Data (MANUAL Node)
```json
{
  "orders": [
    {
      "orderId": "ORD-001",
      "customerId": 101,
      "customerName": "Alice Johnson",
      "customerEmail": "alice@example.com",
      "status": "pending",
      "totalAmount": 1500,
      "items": [
        { "productId": "PROD-A", "quantity": 2, "price": 500 },
        { "productId": "PROD-B", "quantity": 1, "price": 500 }
      ],
      "createdAt": "2024-11-01T10:00:00Z"
    },
    {
      "orderId": "ORD-002",
      "customerId": 102,
      "customerName": "Bob Smith",
      "customerEmail": "bob@example.com",
      "status": "processing",
      "totalAmount": 300,
      "items": [
        { "productId": "PROD-C", "quantity": 3, "price": 100 }
      ],
      "createdAt": "2024-11-01T11:00:00Z"
    },
    {
      "orderId": "ORD-003",
      "customerId": 103,
      "customerName": "Charlie Brown",
      "customerEmail": "charlie@example.com",
      "status": "shipped",
      "totalAmount": 800,
      "items": [
        { "productId": "PROD-D", "quantity": 2, "price": 400 }
      ],
      "createdAt": "2024-11-01T09:00:00Z"
    },
    {
      "orderId": "ORD-004",
      "customerId": 104,
      "customerName": "Diana Prince",
      "customerEmail": "diana@example.com",
      "status": "cancelled",
      "totalAmount": 0,
      "items": [],
      "createdAt": "2024-10-31T15:00:00Z"
    },
    {
      "orderId": "ORD-005",
      "customerId": 105,
      "customerName": "Eve Davis",
      "customerEmail": "eve@example.com",
      "status": "pending",
      "totalAmount": 450,
      "items": [
        { "productId": "PROD-E", "quantity": 1, "price": 450 }
      ],
      "createdAt": "2024-11-02T08:00:00Z"
    }
  ]
}
```

---

## 🔄 Workflow Steps

### **Node 1: MANUAL (Trigger)**
**Config:**
```json
{
  "formFields": [
    { "fieldName": "orders", "fieldType": "array", "fieldValue": "[...orders data...]" }
  ]
}
```

**Expected Output:**
```json
{
  "orders": [ ...5 orders... ]
}
```

**Test Points:**
- ✅ Array with 5 items
- ✅ Nested objects (customer info)
- ✅ Nested arrays (items)
- ✅ Different status values
- ✅ Edge case: cancelled order with empty items

---

### **Node 2: HTTP (Fetch Product Details)**
**Config:**
```
Method: POST
URL: https://jsonplaceholder.typicode.com/posts
Body: {
  "title": "Order Sync",
  "body": "{{steps.manual1.orders}}",
  "userId": 1
}
```

**Expected Output:**
```json
{
  "status": 201,
  "body": {
    "id": 101,
    "title": "Order Sync",
    "body": "[...orders...]",
    "userId": 1
  }
}
```

**Test Points:**
- ✅ Token resolution: `{{steps.manual1.orders}}`
- ✅ HTTP POST with JSON body
- ✅ Nested data serialization
- ✅ Response structure (status, body, headers)

---

### **Node 3: SET (Enrich Orders)**
**Config:**
```
Include Other Fields: true
Fields to Set:
[
  { key: "orders", value: "{{steps.manual1.orders}}", type: "array" },
  { key: "syncedAt", value: "2024-11-02T12:00:00Z", type: "string" },
  { key: "syncStatus", value: "success", type: "string" },
  { key: "apiResponseId", value: "{{steps.http1.body.id}}", type: "number" }
]
```

**Expected Output:**
```json
{
  "orders": [ ...5 orders... ],
  "syncedAt": "2024-11-02T12:00:00Z",
  "syncStatus": "success",
  "apiResponseId": 101
}
```

**Test Points:**
- ✅ Merge with previous output
- ✅ Add new fields
- ✅ Token from HTTP response: `{{steps.http1.body.id}}`
- ✅ Type conversion (number)

---

### **Node 4: SPLIT (Extract Orders Array)**
**Config:**
```
Fields to Split Out: ["orders"]
Include Mode: "none"
```

**Expected Output:**
```json
{
  "orders": [ ...5 orders... ]
}
```

**Test Points:**
- ✅ Extract only "orders" field
- ✅ Remove other fields (syncedAt, syncStatus, apiResponseId)
- ✅ Array remains intact

---

### **Node 5: FILTER (Active Orders Only)**
**Config:**
```
Logic: AND
Mode: include
Conditions: [
  {
    field: "{{steps.split1.orders[0].status}}",
    fieldType: "string",
    operator: "is not equal to",
    value: "cancelled"
  }
]
```

**Expected Output:**
```json
[
  { orderId: "ORD-001", status: "pending", ... },
  { orderId: "ORD-002", status: "processing", ... },
  { orderId: "ORD-003", status: "shipped", ... },
  { orderId: "ORD-005", status: "pending", ... }
]
```

**Test Points:**
- ✅ Filter array items
- ✅ Condition: status != "cancelled"
- ✅ Remove ORD-004 (cancelled)
- ✅ Keep 4 out of 5 orders
- ✅ Token with array notation: `orders[0].status`

---

### **Node 6: SWITCH (Route by Status)**
**Config:**
```
Mode: filter
Value / Array: "{{steps.filter1}}"
Filter Path: "status"
Cases: ["pending", "processing", "shipped"]
Default Case: "other"
```

**Expected Output:**
```json
{
  "case_0": [ // pending
    { orderId: "ORD-001", status: "pending", ... },
    { orderId: "ORD-005", status: "pending", ... }
  ],
  "case_1": [ // processing
    { orderId: "ORD-002", status: "processing", ... }
  ],
  "case_2": [ // shipped
    { orderId: "ORD-003", status: "shipped", ... }
  ],
  "default": []
}
```

**Test Points:**
- ✅ Filter mode (array splitting)
- ✅ Multiple output branches
- ✅ Field path extraction: "status"
- ✅ Case matching
- ✅ Empty default case

---

### **Node 7A: IF (Check High Value Orders) - Connected to case_0**
**Config:**
```
Mode: simple
Left Value: "{{steps.switch1.case_0[0].totalAmount}}"
Operator: ">"
Right Value: "1000"
```

**Expected Output:**
```json
{
  "TRUE": [
    { orderId: "ORD-001", totalAmount: 1500, ... } // Only high value
  ],
  "FALSE": [
    { orderId: "ORD-005", totalAmount: 450, ... } // Low value
  ]
}
```

**Test Points:**
- ✅ Array filtering by condition
- ✅ Numeric comparison: amount > 1000
- ✅ Split TRUE/FALSE branches
- ✅ Token with nested path: `case_0[0].totalAmount`

---

### **Node 7B: SET (Add Priority Flag) - Connected to IF TRUE**
**Config:**
```
Include Other Fields: true
Fields to Set:
[
  { key: "priority", value: "HIGH", type: "string" },
  { key: "flaggedAt", value: "2024-11-02T12:30:00Z", type: "string" }
]
```

**Expected Output:**
```json
[
  {
    orderId: "ORD-001",
    status: "pending",
    totalAmount: 1500,
    priority: "HIGH",
    flaggedAt: "2024-11-02T12:30:00Z",
    ...
  }
]
```

**Test Points:**
- ✅ Per-item field addition
- ✅ Maintain array structure
- ✅ Add priority flag to high-value orders

---

### **Node 8: SPLIT (Extract Customer Info) - Connected to case_1**
**Config:**
```
Fields to Split Out: ["customerId", "customerName", "customerEmail"]
Include Mode: "selected"
Selected Fields: ["orderId", "status"]
```

**Expected Output:**
```json
[
  {
    customerId: 102,
    customerName: "Bob Smith",
    customerEmail: "bob@example.com",
    orderId: "ORD-002",
    status: "processing"
  }
]
```

**Test Points:**
- ✅ Extract specific fields
- ✅ Include mode: "selected"
- ✅ selectedFields array
- ✅ Per-item extraction

---

## ✅ Expected Final State

### **Outputs Summary:**
```
manual1.output:
  → Full orders array (5 items)

http1.output:
  → API response { status: 201, body: {...} }

set1.output:
  → Enriched data with syncedAt, syncStatus, apiResponseId

split1.output:
  → Only orders array extracted

filter1.output:
  → 4 active orders (cancelled removed)

switch1.output:
  → case_0: 2 pending orders
  → case_1: 1 processing order
  → case_2: 1 shipped order
  → default: []

if1.output:
  → TRUE: 1 high-value order (ORD-001)
  → FALSE: 1 low-value order (ORD-005)

set2.output:
  → High-value order with priority flag

split2.output:
  → Customer info extracted from processing order
```

---

## 🧪 Test Cases Coverage

### **Data Types:**
- ✅ String
- ✅ Number
- ✅ Boolean (in comparisons)
- ✅ Array
- ✅ Object (nested)
- ✅ Null/Empty (cancelled order)

### **Node Features:**
- ✅ MANUAL: Array input
- ✅ HTTP: POST with JSON body, token resolution
- ✅ SET: Multiple field types, token from previous nodes, per-item processing
- ✅ SPLIT: Field extraction, include modes
- ✅ FILTER: Array filtering, string comparison, token with array notation
- ✅ SWITCH: Filter mode, multiple cases, field path extraction
- ✅ IF: Numeric comparison, array filtering, TRUE/FALSE branches

### **Edge Cases:**
- ✅ Empty array (cancelled order items)
- ✅ Nested objects/arrays
- ✅ Multiple branches (SWITCH)
- ✅ Conditional routing (IF)
- ✅ Per-item transformations (SET, SPLIT)
- ✅ Token resolution depth (steps.xxx.yyy.zzz)

---

## 🚀 Execution Steps

1. **Create MANUAL node** with orders data
2. **Execute MANUAL** → Check output
3. **Add HTTP node** → Connect → Configure → Execute
4. **Add SET node** → Connect → Configure tokens → Execute
5. **Add SPLIT node** → Connect → Configure fields → Execute
6. **Add FILTER node** → Connect → Configure condition → Execute
7. **Add SWITCH node** → Connect → Configure cases → Execute
8. **Add IF node** → Connect to case_0 → Configure → Execute
9. **Add SET node** → Connect to TRUE branch → Configure → Execute
10. **Add SPLIT node** → Connect to case_1 → Configure → Execute

---

## 📊 Success Criteria

- [ ] All nodes execute without errors
- [ ] Token resolution works across all connections
- [ ] Data transformations produce expected output
- [ ] Array operations handle per-item correctly
- [ ] Branching (SWITCH, IF) creates proper outputs
- [ ] Final data matches expected schema
- [ ] UI shows correct data flow in Result panel
- [ ] No runtime errors in console

---

## 🐛 Known Issues to Watch

1. **Token Resolution**: Deep nested paths (e.g., `steps.xxx.yyy[0].zzz`)
2. **Array Processing**: Per-item vs whole-array operations
3. **Type Coercion**: String "1000" vs Number 1000 in comparisons
4. **Empty Arrays**: Edge case handling
5. **Branch Connections**: Multiple outputs from SWITCH
6. **Schema Detection**: If nodes don't understand input type


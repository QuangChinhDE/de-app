# 🧪 Hướng Dẫn Test Workflow - E-commerce Order Processing

## 📋 Kịch Bản: Xử Lý Đơn Hàng E-commerce

Workflow này mô phỏng quy trình xử lý đơn hàng từ hệ thống e-commerce, bao gồm:
- Đồng bộ đơn hàng lên API
- Lọc đơn hàng hợp lệ
- Phân loại theo trạng thái
- Gắn cờ đơn hàng có giá trị cao
- Trích xuất thông tin khách hàng

---

## 🎯 Mục Tiêu Test

Verify mỗi node xử lý data đúng chức năng và data flow giữa các nodes hoạt động smooth.

---

## 📊 Test Data

### Input: 5 đơn hàng với các trạng thái khác nhau

| Order ID | Customer | Status | Total Amount | Expected Result |
|----------|----------|--------|--------------|-----------------|
| ORD-001 | Alice Johnson | pending | $1,500 | ✅ Kept → High Priority |
| ORD-002 | Bob Smith | processing | $300 | ✅ Kept → Normal |
| ORD-003 | Charlie Brown | shipped | $800 | ✅ Kept → Normal |
| ORD-004 | Diana Prince | cancelled | $0 | ❌ Filtered out |
| ORD-005 | Eve Davis | pending | $450 | ✅ Kept → Normal |

---

## 🔄 Workflow Flow (9 Nodes)

```
manual1 → http1 → set1 → split1 → filter1 → switch1 → if1 → set2 → split2
```

---

## 📝 Hướng Dẫn Test Từng Bước

### Bước 1: Mở Ứng Dụng

1. Mở browser tại: **http://localhost:5174**
2. Workflow sẽ tự động load với 9 nodes
3. Quan sát layout: Các nodes được sắp xếp theo chiều dọc (vertical)

**✅ Expected:**
- Thấy 9 nodes trên canvas
- Các nodes có màu khác nhau theo category:
  - 🔔 Manual Trigger (Amber)
  - 🔌 HTTP Request (Blue)
  - ⚙️ Set, Split, Filter, Switch, If (Purple)

---

### Bước 2: Chạy Toàn Bộ Workflow

1. Tìm toolbar ở trên cùng
2. Click nút **"▶️ Run flow"**
3. Quan sát các nodes lần lượt:
   - Status chuyển từ "idle" → "running" → "success"
   - Màu dot indicator: gray → blue (pulse) → green

**✅ Expected:**
- Tất cả 9 nodes có status **"✓ Success"**
- Không có node nào bị **"✕ Failed"**
- Thời gian thực thi: ~2-5 giây

**❌ Nếu có lỗi:**
- Mở DevTools (F12) → Console tab
- Tìm log có chữ **"[Error]"** hoặc màu đỏ
- Copy toàn bộ error message

---

### Bước 3: Verify Từng Node

#### 🔍 Node 1: Manual Trigger (manual1)

**Chức năng:** Cung cấp 5 đơn hàng test

**Cách verify:**
1. **Double-click** vào node `manual1`
2. Panel bên phải mở ra
3. Click tab **"Result"**

**✅ Expected Output:**
```json
{
  "orders": [
    {
      "orderId": "ORD-001",
      "customerName": "Alice Johnson",
      "status": "pending",
      "totalAmount": 1500,
      ...
    },
    ... (4 orders more)
  ]
}
```

**Check Points:**
- [ ] Có đúng 5 orders
- [ ] Mỗi order có: orderId, customerName, status, totalAmount, items
- [ ] Statuses: pending, processing, shipped, cancelled, pending

---

#### 🌐 Node 2: HTTP Request (http1)

**Chức năng:** POST orders data lên API test (jsonplaceholder.typicode.com)

**Cách verify:**
1. Double-click node `http1`
2. Tab **"Result"**

**✅ Expected Output:**
```json
{
  "status": 201,
  "headers": { ... },
  "body": {
    "id": 101,  // ← API generated ID
    "title": "Order Sync",
    "body": "...",
    "userId": 1
  }
}
```

**Check Points:**
- [ ] status = 201 (Created)
- [ ] body.id là số (ví dụ: 101)
- [ ] body.title = "Order Sync"

---

#### 📝 Node 3: Set Variables (set1)

**Chức năng:** Kết hợp data từ manual1 và http1, thêm metadata

**Cách verify:**
1. Double-click node `set1`
2. Tab **"Result"**

**✅ Expected Output:**
```json
{
  "orders": [ ... 5 orders array ... ],
  "syncedAt": "2024-11-02T12:00:00Z",
  "syncStatus": "success",
  "apiResponseId": 101  // ← From http1.body.id
}
```

**Check Points:**
- [ ] Có field `orders` (array of 5 items)
- [ ] Có field `syncedAt` (timestamp)
- [ ] Có field `syncStatus` = "success"
- [ ] Có field `apiResponseId` (số từ HTTP response)

**❗Important:** Node này **kết hợp data từ 2 nguồn**:
- `orders` từ manual1
- `apiResponseId` từ http1

---

#### ✂️ Node 4: Split Array (split1)

**Chức năng:** Trích xuất array `orders` ra khỏi wrapper object

**Cách verify:**
1. Double-click node `split1`
2. Tab **"Result"**

**✅ Expected Output:**
```json
[
  { "orderId": "ORD-001", ... },
  { "orderId": "ORD-002", ... },
  { "orderId": "ORD-003", ... },
  { "orderId": "ORD-004", ... },  // ← cancelled, sẽ bị lọc sau này
  { "orderId": "ORD-005", ... }
]
```

**Check Points:**
- [ ] Output là **ARRAY** (không còn wrapped trong object)
- [ ] Có đúng **5 items**
- [ ] Mỗi item là 1 order object

**🎯 Magic Moment:**
Node này áp dụng **Smart Unwrap**:
- Input: `{orders: [...]}`
- Detect: Đang split 1 field duy nhất + field đó là array
- Output: `[...]` (auto unwrap!)

---

#### 🔍 Node 5: Filter (filter1)

**Chức năng:** Lọc bỏ đơn hàng có status = "cancelled"

**Cách verify:**
1. Double-click node `filter1`
2. Tab **"Result"**

**✅ Expected Output:**
```json
{
  "filtered": [
    { "orderId": "ORD-001", "status": "pending", ... },
    { "orderId": "ORD-002", "status": "processing", ... },
    { "orderId": "ORD-003", "status": "shipped", ... },
    { "orderId": "ORD-005", "status": "pending", ... }
  ],
  "removed": [
    { "orderId": "ORD-004", "status": "cancelled", ... }
  ],
  "summary": {
    "total": 5,
    "filtered": 4,
    "removed": 1
  }
}
```

**Check Points:**
- [ ] `filtered` có **4 orders** (ORD-001, 002, 003, 005)
- [ ] `removed` có **1 order** (ORD-004 - cancelled)
- [ ] Không có order nào với status="cancelled" trong `filtered`

---

#### 🔀 Node 6: Switch (switch1)

**Chức năng:** Phân loại orders theo status (pending/processing/shipped)

**Cách verify:**
1. Double-click node `switch1`
2. Tab **"Result"**

**✅ Expected Output:**
```json
{
  "case_0": [
    { "orderId": "ORD-001", "status": "pending", "totalAmount": 1500 },
    { "orderId": "ORD-005", "status": "pending", "totalAmount": 450 }
  ],
  "case_1": [
    { "orderId": "ORD-002", "status": "processing", "totalAmount": 300 }
  ],
  "case_2": [
    { "orderId": "ORD-003", "status": "shipped", "totalAmount": 800 }
  ],
  "default": []
}
```

**Check Points:**
- [ ] `case_0` (pending): **2 orders** - ORD-001 ($1,500), ORD-005 ($450)
- [ ] `case_1` (processing): **1 order** - ORD-002 ($300)
- [ ] `case_2` (shipped): **1 order** - ORD-003 ($800)
- [ ] `default`: **empty array** (không có status khác)

**📊 Distribution:**
- Pending: 50% (2/4)
- Processing: 25% (1/4)
- Shipped: 25% (1/4)

---

#### ❓ Node 7: If Condition (if1)

**Chức năng:** Kiểm tra pending orders: totalAmount > $1,000?

**Cách verify:**
1. Double-click node `if1`
2. Tab **"Result"**

**✅ Expected Output:**
```json
{
  "TRUE": [
    { "orderId": "ORD-001", "totalAmount": 1500, "status": "pending" }
  ],
  "FALSE": [
    { "orderId": "ORD-005", "totalAmount": 450, "status": "pending" }
  ]
}
```

**Check Points:**
- [ ] `TRUE`: **1 order** - ORD-001 ($1,500 > $1,000) ✅
- [ ] `FALSE`: **1 order** - ORD-005 ($450 < $1,000) ❌

**🎯 Smart Unwrap in Action:**
- Input từ switch1: `{case_0: [...], case_1: [...], ...}`
- If node tự động detect và process `case_0` (pending orders)
- Không cần config `{{steps.switch1.case_0}}`!

---

#### 📝 Node 8: Set Variables (set2)

**Chức năng:** Thêm priority flag cho high-value orders

**Cách verify:**
1. Double-click node `set2`
2. Tab **"Result"**

**✅ Expected Output:**
```json
[
  {
    "orderId": "ORD-001",
    "totalAmount": 1500,
    "status": "pending",
    "priority": "HIGH",  // ← Added
    "flaggedAt": "2024-11-02T12:30:00Z"  // ← Added
    ... (all original fields preserved)
  }
]
```

**Check Points:**
- [ ] Có field `priority` = "HIGH"
- [ ] Có field `flaggedAt` (timestamp)
- [ ] **Tất cả fields gốc vẫn còn** (orderId, customerName, status, etc.)

**Note:** Node này chỉ xử lý TRUE branch (high-value orders)

---

#### ✂️ Node 9: Split Array (split2)

**Chức năng:** Trích xuất thông tin liên hệ khách hàng

**Cách verify:**
1. Double-click node `split2`
2. Tab **"Result"**

**✅ Expected Output:**
```json
[
  {
    "customerId": 101,
    "customerName": "Alice Johnson",
    "customerEmail": "alice@example.com",
    "orderId": "ORD-001",
    "status": "pending"
  }
]
```

**Check Points:**
- [ ] Chỉ có **5 fields**: customerId, customerName, customerEmail, orderId, status
- [ ] **Không có** fields: totalAmount, items, createdAt, priority, flaggedAt
- [ ] Đây là data "cleaned" để gửi cho CRM hoặc Email service

---

## 🎬 Quick Test Checklist

Sau khi chạy workflow, verify nhanh:

```
✅ manual1:  5 orders
✅ http1:    status 201, có body.id
✅ set1:     4 fields (orders, syncedAt, syncStatus, apiResponseId)
✅ split1:   Array of 5 orders (unwrapped)
✅ filter1:  4 filtered + 1 removed
✅ switch1:  case_0(2), case_1(1), case_2(1), default(0)
✅ if1:      TRUE(1), FALSE(1)
✅ set2:     Added priority + flaggedAt
✅ split2:   Only 5 fields (customer contact info)
```

---

## 🐛 Troubleshooting

### Issue 1: Node bị Failed
**Triệu chứng:** Node có status "✕ Failed", màu đỏ

**Cách debug:**
1. Double-click vào node bị lỗi
2. Xem error message trong panel
3. Mở Console (F12) → tìm log có `[NodeType Runtime]`
4. Check xem data từ node trước có đúng format không

**Common causes:**
- Token không resolve được (typo trong field name)
- Data type không match (expect array, got object)
- API timeout hoặc network error (http node)

---

### Issue 2: Node chạy nhưng output không đúng
**Triệu chứng:** Status "✓ Success" nhưng kết quả sai

**Cách debug:**
1. Check output của **node trước đó**
2. Verify input data có đúng structure không
3. Check config của node hiện tại:
   - Filter: Conditions đúng không?
   - Switch: Cases có match với data không?
   - If: Operator và value đúng không?

---

### Issue 3: Workflow chạy chậm
**Triệu chứng:** Mất >10 giây để chạy xong

**Lý do có thể:**
- HTTP request timeout (network chậm)
- Data quá lớn (>1000 items)

**Fix:**
- Check network connection
- Giảm số lượng test data

---

## 🔍 Console Logs Guide

Khi chạy workflow, Console sẽ show logs theo format:

```
[MANUAL Runtime] Starting execution
[MANUAL Runtime] Form fields: [...]
[MANUAL Runtime] Output: {...}

[HTTP Runtime] Starting execution
[HTTP Runtime] Method: POST, URL: https://...
[HTTP Runtime] Response status: 201

[SET Runtime] Starting execution
[SET Runtime] Fields to set: 4
[SET Runtime] Previous data: {...}

[SPLIT Runtime] Starting execution
[SPLIT Runtime] Fields to split: ["orders"]
[SPLIT Runtime] Smart unwrap: Returning array field "orders" directly (5 items)  ← 🎯

[Filter Runtime] Starting execution
[Filter Runtime] Previous data (after smart unwrap): [...]  ← 🎯
[Filter Runtime] Using previous data as array, length: 5

[SWITCH Runtime] Filter mode
[SWITCH Runtime] Split into cases: case_0(2), case_1(1), case_2(1)

[IF Runtime] Array filter mode detected  ← 🎯
[IF Runtime] Splitting array by condition
[IF Runtime] TRUE: 1 items, FALSE: 1 items
```

**🎯 = Smart features working!**

---

## 📈 Expected Performance

| Node | Duration | Notes |
|------|----------|-------|
| manual1 | <10ms | Instant |
| http1 | 200-500ms | Network dependent |
| set1 | <5ms | Fast |
| split1 | <5ms | Fast |
| filter1 | <10ms | Fast |
| switch1 | <10ms | Fast |
| if1 | <10ms | Fast |
| set2 | <5ms | Fast |
| split2 | <5ms | Fast |
| **Total** | **~300-600ms** | Mostly HTTP wait |

---

## 🎓 Learning Points

### 1. Data Flow Pattern
```
Object → Array → Filtered Array → Grouped Object → Conditional Split → Enhanced → Cleaned
```

### 2. Smart Features
- **Auto-unwrap**: Split node tự động unwrap array
- **Smart detection**: Filter/If nodes tự động detect array từ SWITCH
- **Type handling**: Nodes adapt to upstream data structure

### 3. Token Resolution
- `{{steps.manual1.orders}}` → Array from manual1
- `{{steps.http1.body.id}}` → Nested field access
- Tokens resolved BEFORE node execution

---

## ✅ Success Criteria

Workflow test thành công khi:

1. ✅ All 9 nodes: Status "✓ Success"
2. ✅ No errors in Console
3. ✅ Each node output matches expected format
4. ✅ Data transformations are correct:
   - 5 → 5 → 5 → 5 → 4 → 4 split into 3 groups → 2 split into TRUE/FALSE → 1 enhanced → 1 cleaned
5. ✅ Total duration < 1 second (excluding network)

---

## 🚀 Next Steps

Sau khi test xong workflow này:

1. **Experiment:** Thử modify config của các nodes
2. **Add nodes:** Thêm node mới vào workflow
3. **Custom data:** Thay đổi test data trong manual1
4. **Edge cases:** Test với empty arrays, null values
5. **Performance:** Test với 100+ orders

---

**Happy Testing! 🎉**

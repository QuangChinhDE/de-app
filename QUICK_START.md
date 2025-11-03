# 🚀 Quick Start: Kéo Data Đơn Giản

## ✨ Tính Năng Mới: Kéo Output Trực Tiếp Từ Node!

### 🎯 Cách Dùng (3 Bước)

#### 1️⃣ Chạy Node
- Thêm HTTP node từ sidebar
- Config URL (vd: `https://jsonplaceholder.typicode.com/users/1`)
- Click **RUN** button trên node

#### 2️⃣ Mở Output Popup
- Node hiện button **📦 ▼** màu xanh lá
- Click **📦 ▼** → Popup hiện danh sách fields
- Popup tự động extract tối đa 20 fields

#### 3️⃣ Kéo & Thả
- **Kéo field** từ popup
- **Thả vào input** của node khác
- Token `{{steps.xxx.field}}` tự động insert!

---

## 🎨 Visual Feedback

### 📦 Button Output
```
[RUN] [📦 ▼]  ← Click để mở popup
      ↑ Chỉ hiện khi node có output
```

### 🏷️ Popup Fields
```
┌─────────────────────────────┐
│ 📦 Output Fields         ✕  │
├─────────────────────────────┤
│ 👆 Drag any field below ... │
│                             │
│ 🏷️ id          "1"          │ ← Draggable
│ 🏷️ name        "Leanne..."  │ ← Draggable  
│ 🏷️ email       "Sincere..." │ ← Draggable
└─────────────────────────────┘
```

### ⬇️ Drop Zone
```
Input field khi hover:
┌─────────────────────────────┐
│    ⬇️ DROP HERE             │ ← Label animation
│ ╔═══════════════════════╗   │
│ ║ [your input field]    ║   │ ← Ring 4px xanh
│ ╚═══════════════════════╝   │
└─────────────────────────────┘
```

---

## ⚡ So Sánh Với Cách Cũ

| | Cách Cũ | Cách Mới |
|---|---|---|
| **Vị trí kéo** | Tab DATA | Trên node canvas |
| **Số bước** | 5 bước | 3 bước |
| **Phải mở tab** | ✅ Phải | ❌ Không |
| **Tìm field** | Expand tree | Tự động list |
| **Nested data** | Phải expand | Auto flat |
| **Tốc độ** | 🐢 Chậm | ⚡ Nhanh |

---

## 💡 Tips

### ✅ Tự Động Extract
Popup tự động "flat" nested objects:
```json
{
  "body": {
    "data": {
      "user": {
        "name": "John"
      }
    }
  }
}
```
Hiển thị: `🏷️ name` (path: `body.data.user.name`)

### ✅ Array Handling
Arrays cũng được extract:
```json
["item1", "item2", "item3"]
```
Hiển thị: `🏷️ [0]`, `🏷️ [1]`, `🏷️ [2]`

### ✅ Limit 20 Fields
Popup chỉ hiện 20 fields đầu tiên.  
**Muốn xem tất cả?** → Dùng tab DATA!

---

## 🎉 Demo Workflow

### Example: API → Formatter

**Step 1: HTTP Node**
```
URL: https://jsonplaceholder.typicode.com/users/1
Method: GET
```
Click **RUN** → Status: Success ✅

**Step 2: Mở Popup**
Click **📦 ▼** trên HTTP node → Popup hiện:
```
🏷️ id          "1"
🏷️ name        "Leanne Graham"  
🏷️ username    "Bret"
🏷️ email       "Sincere@april.biz"
```

**Step 3: Add Formatter**
Click **Formatter** trong sidebar → Node mới xuất hiện

**Step 4: Kéo Field**
- Kéo `🏷️ name` từ popup
- Thả vào input của Formatter
- Token inserted: `{{steps.http_xxx.body.name}}`

**Step 5: Run Formatter**
Click **RUN** → Output: "Leanne Graham" ✅

---

## 🔧 Troubleshooting

### ❓ Không thấy button 📦?
- ✅ Node phải **chạy thành công** trước
- ✅ Output phải **có data** (không null/undefined)

### ❓ Popup không hiện?
- ✅ Click đúng button **📦 ▼**
- ✅ Node phải có **runState.lastRun.output**

### ❓ Không kéo được field?
- ✅ Field phải là **leaf** (không phải object/array rỗng)
- ✅ Cursor phải đổi thành **grab** (✋)

### ❓ Drop không work?
- ✅ Input phải **hỗ trợ token** (text/textarea/json)
- ✅ Phải thấy **ring xanh** + "DROP HERE"

---

## 📚 Docs Liên Quan

- [DRAG_DROP_GUIDE.md](./DRAG_DROP_GUIDE.md) - Chi tiết 2 cách kéo-thả
- [LAYOUT_GUIDE.md](./LAYOUT_GUIDE.md) - Bố cục UI
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Changelog

---

**Dev Server:** http://localhost:5173/

**Happy dragging! 🎯**

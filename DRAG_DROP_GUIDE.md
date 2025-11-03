# 🎯 Hướng Dẫn Kéo-Thả Data Giữa Các Nodes

## 📋 Tổng Quan

Node Playground hỗ trợ **2 cách drag-and-drop** đơn giản để map data từ output của node trước sang input của node sau:

1. 🎯 **Kéo trực tiếp từ Node trên Canvas** (Đơn giản nhất!)
2. 🗂️ **Kéo từ tab DATA** (Chi tiết hơn)

---

## � CÁCH 1: Kéo Trực Tiếp Từ Node (ĐƠN GIẢN!)

### Bước 1️⃣: Chạy Node Đầu Tiên

1. **Thêm node** (vd: HTTP node) từ sidebar bên trái
2. **Cấu hình node** trong Config Panel bên phải (URL, method, headers...)
3. **Click nút RUN** trong node trên canvas
4. Node sẽ hiển thị button **📦 ▼** khi có output

### Bước 2️⃣: Mở Output Popup Từ Node

1. Trên **canvas**, node vừa chạy sẽ có button **� ▼** màu xanh lá
2. **Click button 📦 ▼** → Popup hiện ra với danh sách output fields
3. Popup hiển thị tối đa 20 fields, mỗi field có:
   - 🏷️ Icon & tên field
   - Preview value
   - Border gradient emerald

### Bước 3️⃣: Kéo Field Vào Node Khác

**Thao tác đơn giản:**

1. Trong popup, **click và giữ** field bạn muốn dùng
2. **Kéo** field đến Config Panel (bên phải)
3. **Di chuyển** đến input field của node tiếp theo
4. Khi hover đúng input, bạn thấy:
   - **Ring 4px xanh indigo** quanh input
   - Label **"⬇️ DROP HERE"** animation pulse
   - Background xanh nhạt
5. **Thả chuột** → Token `{{steps.xxx.field}}` tự động insert!

**Ưu điểm:**
✅ Không cần mở tab DATA  
✅ Không cần tìm trong cây dữ liệu  
✅ Kéo ngay từ node trên canvas  
✅ Popup hiện đúng fields của node đó  

---

## 🗂️ CÁCH 2: Kéo Từ Tab DATA (Chi Tiết)

### Khi nào dùng?
- Muốn xem **toàn bộ cấu trúc** dữ liệu
- Cần **nested fields** sâu trong object
- Muốn xem data từ **nhiều nodes** cùng lúc

### Các bước:

1. Chạy node → Chuyển sang tab **🗂️ DATA** trong Results Panel
2. Expand cây dữ liệu (click +/−)
3. **Kéo leaf fields** (🏷️) vào Config Panel
4. Thả vào input → Token inserted

**So sánh:**

| Đặc điểm | Kéo từ Node | Kéo từ DATA Tab |
|----------|-------------|-----------------|
| **Tốc độ** | ⚡ Rất nhanh | 🐢 Chậm hơn |
| **Đơn giản** | ✅ Dễ dàng | ❌ Phức tạp hơn |
| **Fields hiển thị** | Top 20 | Toàn bộ |
| **Nested data** | Auto flat | Phải expand |
| **Multi-node** | ❌ 1 node | ✅ Nhiều nodes |

---

## ✅ Visual Feedback

### 🏷️ Khi Kéo Field
- Field được kéo sẽ:
  - **Scale lên 110%**
  - **Border chuyển màu indigo**
  - **Opacity giảm 70%**
  - **Shadow to ra**

### 🎯 Khi Hover Input (Drop Zone)
- Input field sẽ:
  - **Ring 4px màu indigo**
  - **Background xanh nhạt**
  - **Label "DROP HERE" animation pulse**

### ✔️ Sau Khi Drop
- Token được insert vào input
- Giá trị hiển thị: `{{steps.http_123.body.data.id}}`
- Token sẽ được resolve khi chạy node

---

## 🎨 Phân Chia Bố Cục Rõ Ràng

### 🏗️ **3 Khu Vực Chính**

```
┌──────────────┬────────────────────────┬──────────────────────┐
│   SIDEBAR    │       CANVAS           │   CONFIG PANEL       │
│   (Dark)     │      (Light Gray)      │   (White + Blue)     │
│              │                        │                      │
│ ⚡ Playground │   🎨 Workflow Graph    │  ⚙️ Configuration    │
│              │                        │  - Node settings     │
│ 🎮 Controls  │   • Zoom/Pan           │  - Form inputs       │
│ - Run Flow   │   • Auto-layout        │  - Token drop zones  │
│ - Export     │   • MiniMap            │                      │
│ - Import     │                        ├──────────────────────┤
│              │                        │                      │
│ ➕ Add Nodes │                        │  📊 Results          │
│ - HTTP       │                        │   (White + Green)    │
│ - SetVar     │                        │                      │
│ - Formatter  │                        │  4 tabs:             │
│              │                        │  📤 Request          │
└──────────────┴────────────────────────┤  📥 Response         │
                                        │  📜 Logs             │
                                        │  🗂️ DATA ← DRAG FROM │
                                        └──────────────────────┘
```

### 🎨 **Color Coding**

| Khu vực | Màu chủ đạo | Mục đích |
|---------|-------------|----------|
| **Sidebar** | Dark Slate (800-900) | Navigation & Controls |
| **Canvas** | Light Gray (50) | Workspace |
| **Config Panel** | White + Indigo accents | Input/Configuration |
| **Results Panel** | White + Emerald accents | Output/Data |
| **Data Fields** | Blue gradients | Draggable items |

### 📏 **Borders & Dividers**

- **2px solid borders** giữa các khu vực chính
- **Gradients** trong headers để phân biệt sections
- **Shadows** để tạo depth
- **Icons** để identify nhanh chức năng

---

## 🔧 Các Loại Input Hỗ Trợ Drop

✅ **Hỗ trợ token drop:**
- ✔️ Text input (type="string")
- ✔️ Textarea
- ✔️ JSON editor
- ✔️ Code editor
- ✔️ Chips (array input)

❌ **Không hỗ trợ:**
- ❌ Number input
- ❌ Boolean checkbox
- ❌ Select dropdown
- ❌ Radio buttons

---

## 💡 Tips & Tricks

### 🎯 Multi-Token Input
Bạn có thể drop **nhiều tokens** vào cùng một input:
```
Hello {{steps.user.name}}, your order {{steps.order.id}} is ready!
```

### 🔗 Nested Data
Expand cây dữ liệu (click nút + / -) để access nested fields:
```
steps.http_123
  └─ body
      └─ data
          └─ items
              └─ 0
                  └─ id  ← Kéo cái này
```

### ⚡ Quick Test Workflow
1. Add HTTP node → Call JSONPlaceholder API
2. Run node → Xem data trong tab DATA
3. Add Formatter node
4. Kéo `body.id` vào Formatter input
5. Run Formatter → Test token resolution

---

## 🐛 Troubleshooting

### ❓ Không kéo được field?
- ✅ Kiểm tra field là **leaf** (không có children)
- ✅ Cursor phải đổi thành **grab** (✋)
- ✅ Đảm bảo node đã **chạy thành công** (có data trong tab DATA)

### ❓ Drop không thấy token xuất hiện?
- ✅ Input field phải **hỗ trợ token drop** (text/textarea/json)
- ✅ Phải thấy **visual feedback** (ring xanh + "DROP HERE")
- ✅ Thả chuột **chính xác** trên input field

### ❓ Token không resolve?
- ✅ Kiểm tra **syntax** token: `{{steps.nodeKey.path}}`
- ✅ Node trước phải đã **chạy xong** trước khi chạy node sau
- ✅ Xem **Logs tab** để debug resolution errors

---

## 🎉 Demo Workflow

### Example: Fetch User → Format Name

**Step 1: HTTP Node**
```json
{
  "method": "GET",
  "url": "https://jsonplaceholder.typicode.com/users/1"
}
```
Run → Output:
```json
{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  "email": "Sincere@april.biz"
}
```

**Step 2: Formatter Node**
1. Mở tab DATA
2. Expand `http_1` → `body`
3. **Kéo `name`** vào Formatter input
4. Token `{{steps.http_1.body.name}}` được insert
5. Run Formatter → Output: "Leanne Graham"

---

## 📚 Tài Liệu Liên Quan

- [LAYOUT_GUIDE.md](./LAYOUT_GUIDE.md) - Chi tiết về bố cục UI
- [README.md](./README.md) - Hướng dẫn cài đặt & chạy project

---

**Chúc bạn test workflow vui vẻ! 🚀**

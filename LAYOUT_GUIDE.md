# 📐 Node Playground Layout Guide

## Bố Cục Khoa Học (Scientific Layout)

### 🎯 Thiết Kế Mới - 3 Khu Vực Chính

```
┌─────┬──────────────────────────────┬──────────────────────┐
│     │                              │                      │
│  S  │                              │    CONFIG PANEL      │
│  I  │       FLOW CANVAS            │    (Cấu hình node)   │
│  D  │    (Visual workflow)         │                      │
│  E  │                              │    • Node settings   │
│  B  │     • Drag & drop nodes      │    • Form inputs     │
│  A  │     • Auto-layout            │    • Token drop      │
│  R  │     • Zoom/Pan               │    • Fuzz button     │
│     │                              │    • Run button      │
│     │                              │                      │
│ 64px│         (Full height)        ├──────────────────────┤
│     │                              │                      │
│     │                              │   RESULTS PANEL      │
│     │                              │   (Kết quả test)     │
│     │                              │                      │
│     │                              │    4 tabs:           │
│     │                              │    • Request         │
│     │                              │    • Response        │
│     │                              │    • Logs            │
│     │                              │    • Data            │
└─────┴──────────────────────────────┴──────────────────────┘
 Node     Workspace (flex-1)           Right Panel (900px)
Palette                                 • Top 50%: Config
                                       • Bottom 50%: Results
```

### 📊 Tỷ Lệ Khoa Học

- **Sidebar (Trái)**: 64px - Compact node palette + flow controls
- **Canvas (Giữa)**: flex-1 (chiếm hết không gian còn lại)
- **Right Panel (Phải)**: 900px cố định
  - **Config Panel (Trên)**: 50% chiều cao (h-1/2)
  - **Results Panel (Dưới)**: 50% chiều cao (h-1/2)

### 🎨 Cải Tiến Format & UX

#### 1️⃣ **Config Panel** (Cấu hình)
- Header rõ ràng với tên node và loại
- Form cuộn mượt mà
- Token drag-drop từ Data tab
- Fuzz button để generate test data
- Run button nổi bật

#### 2️⃣ **Results Panel** (Kết quả)
- **4 tabs được format lại hoàn toàn:**

##### 📤 REQUEST Tab
- ✅ cURL command với gradient background
- ✅ Request headers table rõ ràng
- ✅ Request body với syntax highlighting
- ✅ Copy buttons tiện lợi

##### 📥 RESPONSE Tab
- ✅ Status stats (3 cột: Status/Duration/Size) với gradient
- ✅ Split view 50/50:
  - Trái: JSON viewer (expand 3 levels)
  - Phải: Raw body + Response headers
- ✅ Improved spacing và readability

##### 📜 LOGS Tab
- ✅ Timeline với card design
- ✅ Hover effects và transitions
- ✅ Color-coded outputs:
  - Emerald: Success
  - Rose: Error
- ✅ Better spacing giữa log entries

##### 🗂️ DATA Tab
- ✅ Drag-drop fields với emoji icons
- ✅ Visual feedback khi drag (🏷️ labels, 📦 objects)
- ✅ Gradient backgrounds
- ✅ Improved hover states
- ✅ Collapsible tree structure

#### 3️⃣ **Canvas** (Workflow)
- Auto-layout horizontal
- Zoom controls
- MiniMap
- Custom node components với status indicators

### 🚀 Workflow Sử Dụng

1. **Add Node** → Click node type ở Sidebar
2. **Configure** → Node tự động select, config panel hiện bên phải
3. **Run** → Click Run button, xem results ngay bên dưới config
4. **Inspect** → Switch giữa 4 tabs: Request/Response/Logs/Data
5. **Map Data** → Drag fields từ Data tab vào config form
6. **Chain** → Add thêm nodes, connect data với tokens

### 🎯 Ưu Điểm Bố Cục Mới

✅ **Canvas chiếm tối đa không gian** → Xem workflow rõ ràng  
✅ **Config + Results luôn visible** → Không cần đóng mở panels  
✅ **50/50 split** → Cân bằng giữa input và output  
✅ **900px right panel** → Đủ rộng cho forms phức tạp  
✅ **Format tabs khoa học** → Dễ đọc, dễ hiểu, dễ copy  
✅ **Visual hierarchy** → Colors, spacing, shadows guide attention  

### 🔧 Technical Details

**App.tsx Structure:**
```tsx
<Sidebar 64px /> 
<FlowCanvas flex-1 /> 
<RightPanel 900px>
  <ConfigPanel h-1/2 />
  <ResultPanel h-1/2 />
</RightPanel>
```

**Responsive Considerations:**
- Right panel có thể collapse khi cần
- Canvas có zoom/pan để xem workflows lớn
- Tabs scroll nếu content quá dài

---

**Enjoy testing your workflows! 🎉**

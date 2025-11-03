# ⚡ Node Playground

> **Visual Workflow Builder** - Xây dựng và test các workflow phức tạp thông qua giao diện kéo thả trực quan

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.10-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.13-blue?logo=tailwindcss)](https://tailwindcss.com/)

## 🎯 Tổng Quan

**Node Playground** là một ứng dụng workflow builder cho phép người dùng tạo ra các luồng xử lý dữ liệu phức tạp thông qua giao diện drag-and-drop trực quan. Hệ thống hỗ trợ nhiều loại node khác nhau và tích hợp tính năng tự động kết nối, xử lý dữ liệu thông minh.

### ✨ Tính Năng Nổi Bật

- **🎨 Visual Workflow Builder**: Xây dựng workflow bằng cách kéo thả các node
- **🔗 Auto Connection**: Tự động kết nối các node theo thứ tự logic
- **📦 Smart Data Flow**: Truyền dữ liệu tự động giữa các node với token resolution
- **🎛️ Multiple Input Support**: Hỗ trợ MERGE node với nhiều input (2-5 inputs)
- **🔄 Real-time Preview**: Xem kết quả ngay lập tức khi chạy workflow
- **🏷️ Drag-and-Drop Fields**: Kéo thả fields từ output để tạo tokens tự động

## 🏗️ Kiến Trúc Hệ Thống

### 📁 Cấu Trúc Thư Mục

```
node-playground/
├── apps/
│   ├── web/                    # React Frontend (Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── components/     # React Components
│   │   │   │   ├── FlowCanvas.tsx       # ReactFlow canvas chính
│   │   │   │   ├── WorkflowNode.tsx     # Custom node component
│   │   │   │   ├── ConfigPanel.tsx      # Panel cấu hình node
│   │   │   │   ├── ResultPanel.tsx      # Panel hiển thị kết quả
│   │   │   │   └── DataFieldsPanel.tsx  # Panel drag-drop fields
│   │   │   ├── nodes/          # Node definitions & runtimes
│   │   │   │   ├── manual/     # Manual trigger node
│   │   │   │   ├── http/       # HTTP request node  
│   │   │   │   ├── filter/     # Array filtering node
│   │   │   │   ├── if/         # Conditional branching
│   │   │   │   ├── switch/     # Multi-case routing
│   │   │   │   ├── merge/      # Multiple input merger ⭐
│   │   │   │   ├── set/        # Data manipulation
│   │   │   │   ├── split/      # Array splitting
│   │   │   │   └── ...
│   │   │   ├── state/          # Zustand store
│   │   │   └── utils/          # Utility functions
│   │   └── package.json
│   └── server/                 # Node.js Backend (Express + TypeScript)
├── packages/
│   └── types/                  # Shared TypeScript definitions
└── package.json               # Workspace configuration
```

### 🔧 Stack Công Nghệ

#### Frontend (Web App)
- **React 18.3.1** - UI framework với hooks và functional components
- **TypeScript 5.4.0** - Type safety và development experience  
- **Vite 5.4.10** - Build tool với HMR và ESM support
- **TailwindCSS 3.4.13** - Utility-first CSS framework
- **ReactFlow (@xyflow/react)** - Visual flow builder library
- **Zustand 4.5.4** - State management
- **React Hook Form 7.53.0** - Form handling với validation
- **Zod 3.23.8** - Schema validation
- **React DnD 16.0.1** - Drag and drop functionality

#### Backend (Server App)  
- **Node.js** với **Express**
- **TypeScript** cho type safety

#### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting  
- **npm workspaces** - Monorepo management
- **Concurrently** - Parallel script execution

## 🚀 Cài Đặt & Chạy

### Yêu Cầu Hệ Thống
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

### 1️⃣ Clone Repository
```bash
git clone https://github.com/QuangChinhDE/de-app.git
cd de-app
```

### 2️⃣ Cài Đặt Dependencies
```bash
# Cài đặt tất cả dependencies cho workspace
npm install
```

### 3️⃣ Chạy Development Server
```bash
# Chạy cả frontend và backend
npm run dev

# Hoặc chạy riêng lẻ:
npm run dev:web      # Chỉ frontend (port 5173)
npm run dev:server   # Chỉ backend (port 3000)
```

### 4️⃣ Build Production
```bash
npm run build
```

### 🌐 Truy Cập Ứng Dụng
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 🎮 Hướng Dẫn Sử Dụng

### 🏃‍♂️ Quick Start - 3 Bước Đơn Giản

#### 1️⃣ **Thêm Node**
- Kéo node từ **Sidebar** vào **Canvas**
- Hệ thống tự động kết nối theo thứ tự
- Các node được auto-layout thông minh

#### 2️⃣ **Cấu Hình Node**
- Click chọn node để mở **Config Panel**
- Điền các thông tin cần thiết (URL, điều kiện, v.v.)
- Sử dụng **Fuzz button** để generate test data

#### 3️⃣ **Chạy & Xem Kết Quả**
- Click **RUN** button trên node hoặc **Run Flow**
- Xem kết quả real-time trong **Results Panel**
- Tabs: Request/Response/Logs/Data

### 🎯 Các Loại Node Chính

| Node Type | Mô Tả | Use Case |
|-----------|-------|----------|
| **Manual** | Trigger thủ công với test data | Khởi tạo workflow với data mẫu |
| **HTTP** | Gọi REST API | Lấy data từ external services |
| **Filter** | Lọc array với nhiều điều kiện (AND logic) | Lọc users active, age > 18, city = "HN" |
| **IF** | Điều kiện TRUE/FALSE | Branch logic đơn giản |
| **Switch** | Multi-case routing | Route theo category, status, v.v. |
| **MERGE** ⭐ | Kết hợp multiple inputs | JOIN data, APPEND arrays, MERGE objects |
| **Set** | Manipulate data fields | Transform, rename, calculate fields |
| **Split** | Tách array thành items | Xử lý từng item trong array |
| **Sort** | Sắp xếp array | Sort theo field, direction |
| **Limit** | Giới hạn số lượng items | Pagination, top N items |

### 🏷️ Smart Features

#### **🔗 Auto Connection**
- Tự động tạo edges giữa các node theo thứ tự thêm vào
- Không cần kéo thả connection thủ công
- Hỗ trợ delete edge bằng click vào nút ✕ trên edge

#### **📦 Data Flow & Token Resolution**
- Tự động truyền output của node trước vào node sau qua `__previousOutput`
- Smart unwrapping cho IF/SWITCH node outputs
- Token format: `{{steps.nodeKey.fieldPath}}`
- Auto-unwrap arrays: `{{steps.http1.users.name}}` thay vì `{{steps.http1.users[0].name}}`

#### **🎨 Drag & Drop Fields**
- Chạy node để có output → Click **📦 ▼** button
- Popup hiển thị tất cả fields có thể kéo
- Kéo field vào input để tự động tạo token
- Visual feedback với drop zones

#### **⭐ MERGE Node - Multiple Inputs**
- Hỗ trợ 2-5 inputs cùng lúc với handles màu sắc khác nhau
- 3 modes: **JOIN** (SQL-like), **APPEND** (concat arrays), **MERGE** (merge objects)
- JOIN types: INNER, LEFT, RIGHT, FULL OUTER
- Conflict resolution strategies cho MERGE mode

## 🧪 Testing & Development

### 🔍 Workflow Testing Example
```yaml
Test Scenario: E-commerce Order Processing
├── Manual Trigger: 5 orders với status khác nhau
├── HTTP Node: Sync orders lên API  
├── Filter Node: Lọc orders hợp lệ (status != "cancelled")
├── IF Node: Phân chia high-value orders (amount > $1000)  
├── Set Node: Add priority flags
└── Results: Categorized orders với metadata
```

### 🐛 Debugging Features
- **Logs tab**: Chi tiết execution logs mỗi node
- **Data tab**: Preview input/output data structure
- **Visual indicators**: Node status (idle/running/success/error)
- **Error handling**: Clear error messages với context

## 🔮 Roadmap & Future Plans

### 🎯 Phase 1 ✅ (Completed)
- [x] Visual workflow builder với ReactFlow
- [x] Basic node types (Manual, HTTP, Filter, IF, Switch)
- [x] Auto connection & data flow
- [x] Drag-and-drop field mapping
- [x] MERGE node với multiple inputs

### 🎯 Phase 2 🚧 (In Progress)
- [ ] Advanced loop constructs với batch processing
- [ ] Custom node creation interface  
- [ ] Workflow templates & sharing
- [ ] Performance optimization cho large workflows

### 🎯 Phase 3 🔄 (Planning)
- [ ] Real-time collaboration
- [ ] Version control cho workflows
- [ ] Plugin system cho custom nodes
- [ ] Cloud deployment & scaling

## 🤝 Contributing

### 🐛 Bug Reports
Nếu bạn gặp bug, vui lòng tạo issue với:
- Mô tả chi tiết steps để reproduce
- Screenshots hoặc GIFs nếu có thể
- Environment info (OS, Node version, Browser)

### 💡 Feature Requests  
- Mô tả rõ ràng tính năng mong muốn
- Explain use case và lợi ích
- Mockups hoặc wireframes nếu có

### 🔧 Development Setup
```bash
# Fork repository
# Clone your fork
git clone https://github.com/your-username/de-app.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes và test
npm run dev
npm run build

# Commit với clear message
git commit -m "Add amazing feature"

# Push và create PR
git push origin feature/amazing-feature
```

## 📊 Technical Highlights

### 🏗️ Architecture Decisions
- **Monorepo structure** với npm workspaces cho scalability
- **Component-based architecture** với clear separation of concerns  
- **Type-safe** development với TypeScript trong toàn bộ stack
- **Reactive state management** với Zustand cho predictable updates
- **Functional programming** patterns cho data transformations

### ⚡ Performance Optimizations
- **Code splitting** với dynamic imports
- **Memoization** cho expensive computations
- **Virtualization** cho large datasets
- **Bundle optimization** với Vite's rollup integration

### 🔒 Code Quality
- **ESLint rules** enforced across codebase
- **Type safety** với strict TypeScript configuration
- **Component testing** setup với modern testing utilities
- **Clean code practices** sau comprehensive cleanup process

## 📞 Liên Hệ & Support

- **GitHub**: [QuangChinhDE/de-app](https://github.com/QuangChinhDE/de-app)
- **Issues**: [GitHub Issues](https://github.com/QuangChinhDE/de-app/issues)

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ by QuangChinhDE**

*"Building workflows should be as intuitive as drawing a flowchart"*
# App Context Documentation

## Overview
ระบบ Context ที่สร้างขึ้นใน Publication Management System ประกอบด้วย Context หลักที่จัดการสถานะต่างๆ ของแอปพลิเคชัน

## โครงสร้างไฟล์ที่สร้าง

```
src/
├── contexts/
│   ├── AppContext.tsx     # Main context with all state management
│   └── index.ts          # Export all hooks and types
├── components/
│   └── providers/
│       ├── ThemeProvider.tsx      # MUI Theme management
│       ├── NotificationProvider.tsx # Toast notifications
│       └── index.tsx             # Combined providers
└── app/
    └── layout.tsx        # Updated to include providers
```

## หลักการทำงาน

### 1. AppContext (src/contexts/AppContext.tsx)
Context หลักที่จัดการสถานะทั้งหมดของแอปพลิเคชัน:

#### State ที่จัดการ:
- **user**: ข้อมูลผู้ใช้จาก Firebase Auth
- **loading**: สถานะการโหลด
- **isAuthenticated**: สถานะการเข้าสู่ระบบ
- **theme**: ธีม (light/dark)
- **language**: ภาษา (th/en)
- **notifications**: ระบบแจ้งเตือน
- **sidebarOpen**: สถานะ sidebar

#### Hooks ที่มีให้ใช้:
- `useApp()` - Hook หลักสำหรับเข้าถึงทุกอย่าง
- `useAuth()` - จัดการการ Authentication
- `useTheme()` - จัดการธีม
- `useLanguage()` - จัดการภาษา
- `useNotifications()` - ระบบแจ้งเตือน
- `useSidebar()` - จัดการ sidebar

### 2. ThemeProvider (src/components/providers/ThemeProvider.tsx)
จัดการ MUI Theme และรองรับ Dark/Light mode

### 3. NotificationProvider (src/components/providers/NotificationProvider.tsx)
แสดงการแจ้งเตือนแบบ Toast ที่มุมขวาบน

## การใช้งาน

### 1. การใช้ Authentication
```typescript
import { useAuth } from "@/contexts";

function MyComponent() {
    const { user, isAuthenticated, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            {isAuthenticated ? (
                <p>สวัสดี {user?.email}</p>
            ) : (
                <p>กรุณาเข้าสู่ระบบ</p>
            )}
        </div>
    );
}
```

### 2. การใช้ Notifications
```typescript
import { useNotifications } from "@/contexts";

function MyComponent() {
    const { showSuccess, showError, notifications } = useNotifications();
    
    const handleSave = () => {
        try {
            // บันทึกข้อมูล
            showSuccess("บันทึกสำเร็จ", "ข้อมูลได้รับการบันทึกแล้ว");
        } catch (error) {
            showError("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
        }
    };
    
    return (
        <div>
            <button onClick={handleSave}>บันทึก</button>
            <p>การแจ้งเตือน: {notifications.length}</p>
        </div>
    );
}
```

### 3. การใช้ Theme
```typescript
import { useTheme } from "@/contexts";

function ThemeToggle() {
    const { theme, toggleTheme, isDark } = useTheme();
    
    return (
        <button onClick={toggleTheme}>
            {isDark ? '🌞' : '🌙'} {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
    );
}
```

### 4. การใช้ Language
```typescript
import { useLanguage } from "@/contexts";

function LanguageToggle() {
    const { language, toggleLanguage, isThai } = useLanguage();
    
    return (
        <button onClick={toggleLanguage}>
            {isThai ? 'EN' : 'ไทย'}
        </button>
    );
}
```

### 5. การใช้ Sidebar
```typescript
import { useSidebar } from "@/contexts";

function Navigation() {
    const { isOpen, toggle, open, close } = useSidebar();
    
    return (
        <div>
            <button onClick={toggle}>
                {isOpen ? 'ปิด' : 'เปิด'} เมนู
            </button>
            {isOpen && (
                <div className="sidebar">
                    <button onClick={close}>❌</button>
                    {/* เมนูต่างๆ */}
                </div>
            )}
        </div>
    );
}
```

## คุณสมบัติพิเศษ

### 1. Auto-save Settings
- Theme และ Language จะถูกบันทึกใน localStorage อัตโนมัติ
- เมื่อเปิดแอปใหม่จะโหลดค่าที่บันทึกไว้

### 2. Firebase Integration
- เชื่อมต่อกับ Firebase Auth อัตโนมัติ
- State จะอัปเดตตาม Auth state

### 3. Auto-dismiss Notifications
- การแจ้งเตือนประเภท success และ info จะหายไปอัตโนมัติใน 5 วินาที
- error และ warning จะค้างไว้จนกว่าผู้ใช้จะกดปิด

### 4. Responsive Design
- การแจ้งเตือนจะแสดงที่ตำแหน่งที่เหมาะสมใน mobile และ desktop

## Type Safety
ทุก Hook และ State มี TypeScript types ที่สมบูรณ์:

```typescript
interface AppState {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    theme: "light" | "dark";
    language: "th" | "en";
    notifications: Notification[];
    sidebarOpen: boolean;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    timestamp: Date;
    read: boolean;
}
```

## ตัวอย่างที่ใช้ในหน้า Login
หน้า login ได้ถูกอัปเดตให้ใช้ Context แล้ว:
- ใช้ `useNotifications()` เพื่อแสดงการแจ้งเตือน
- ใช้ `useAuth()` เพื่อตรวจสอบสถานะ
- แสดงข้อความสำเร็จและข้อผิดพลาดผ่านระบบ Toast

## การขยายระบบ
สามารถเพิ่ม state และ actions ใหม่ได้โดยการ:
1. เพิ่ม properties ใน `AppState`
2. เพิ่ม actions ใน `AppAction`
3. เพิ่มการจัดการใน `appReducer`
4. สร้าง helper functions ใน Context
5. สร้าง custom hooks ใหม่ตามต้องการ

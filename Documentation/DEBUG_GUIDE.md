# 🎨 QUICK VISUAL REFERENCE - DEBUG GUIDE

## System at a Glance

```
┌─────────────────────────────────────────────────────────┐
│         AWLAD ELSAMAN POS - SYSTEM OVERVIEW             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend: React 19 + TypeScript + Tailwind           │
│  Desktop:  Electron + better-sqlite3                  │
│  Security: Bcrypt + RBAC + Audit Logging              │
│  Database: SQLite (9 tables, local)                   │
│                                                         │
│  Status: ✅ PRODUCTION READY                           │
│  Phase:  Phase 1 Complete                             │
│  Users:  5 Roles (27 Permissions)                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│                    SQLITE DATABASE                      │
│                      (pos.db)                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌──────────────┐                 │
│  │   USERS     │◄──►│ PERMISSIONS  │                 │
│  │             │    │              │                 │
│  │ • id        │    │ • role       │                 │
│  │ • username  │    │ • permission │                 │
│  │ • password  │    │ • can_perform│                 │
│  │ • role      │    │              │                 │
│  └──────┬──────┘    └──────────────┘                 │
│         │                                             │
│         │                                             │
│         ▼                                             │
│  ┌──────────────────┐   ┌──────────────────┐        │
│  │  AUDIT_LOGS      │   │   BACKUPS        │        │
│  │                  │   │                  │        │
│  │ • user_id        │   │ • backup_path    │        │
│  │ • action         │   │ • created_by     │        │
│  │ • table_name     │   │ • created_at     │        │
│  │ • timestamp      │   │ • description    │        │
│  └──────────────────┘   └──────────────────┘        │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐               │
│  │  PRODUCTS    │◄──►│ INVOICES     │               │
│  │              │    │              │               │
│  │ • name       │    │ • customer   │               │
│  │ • unit       │    │ • total      │               │
│  │ • price      │    │ • status     │               │
│  │ • stock      │    │ • date       │               │
│  └──────┬───────┘    └──────┬───────┘               │
│         │                   │                        │
│         └───────┬───────────┘                        │
│                 ▼                                     │
│         ┌──────────────────┐                        │
│         │  INVOICE_ITEMS   │                        │
│         │                  │                        │
│         │ • invoice_id     │                        │
│         │ • product_id     │                        │
│         │ • quantity       │                        │
│         │ • unit_price     │                        │
│         │ • line_total     │                        │
│         └──────────────────┘                        │
│                                                         │
│  ┌──────────────┐    ┌──────────────────────┐      │
│  │  PAYMENTS    │    │  RESERVATIONS        │      │
│  │              │    │                      │      │
│  │ • invoice_id │    │ • product_id         │      │
│  │ • amount     │    │ • quantity           │      │
│  │ • date       │    │ • customer_name      │      │
│  └──────────────┘    │ • expiry_date (48hr) │      │
│                      │ • created_at         │      │
│                      └──────────────────────┘      │
│                                                         │
│  ┌──────────────────────────┐                      │
│  │ DATA_VALIDATION_LOGS     │                      │
│  │                          │                      │
│  │ • table_name             │                      │
│  │ • record_id              │                      │
│  │ • field_name             │                      │
│  │ • error_message          │                      │
│  └──────────────────────────┘                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Application Layers

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                       │
│                   (React + TypeScript)                  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │  App.tsx (Router Setup)                             │ │
│ │  ├─ LoginPage       [🔐 Authentication]             │ │
│ │  ├─ PosPage         [💰 Invoice Creation]           │ │
│ │  ├─ ProductsPage    [📦 Product Management]         │ │
│ │  ├─ InvoicesPage    [📋 Invoice Management]         │ │
│ │  ├─ DashboardPage   [📊 Analytics & Charts]         │ │
│ │  ├─ UserMgmtPage    [👥 Admin Panel]               │ │
│ │  └─ AuditLogPage    [📝 Compliance Trail]          │ │
│ │                                                      │ │
│ │  Layout.tsx (Navigation Shell)                      │ │
│ │  └─ Sidebar, Header, Main Content                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                          ▲                              │
│                          │                              │
│                     [api.ts]                            │
│                  (40+ methods)                          │
│                          │                              │
└─────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ IPC Bridge  │
                    │ (Preload)   │
                    └──────┬──────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                  DESKTOP LAYER                          │
│                    (Electron)                           │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │  main.cjs                                            │ │
│ │  └─ Create Window                                   │ │
│ │  └─ Load React App                                 │ │
│ │  └─ Setup IPC Handlers                             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  sqlite.cjs (Main API)                             │ │
│ │  ├─ auth:login                                     │ │
│ │  ├─ user:create, user:list                         │ │
│ │  ├─ product:add, product:list, product:update      │ │
│ │  ├─ invoice:create, invoice:list                   │ │
│ │  ├─ audit:list                                     │ │
│ │  ├─ backup:create, backup:list, backup:restore    │ │
│ │  └─ ... 30+ more methods                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  utils/ (Utility Modules)                          │ │
│ │  ├─ passwordUtils.cjs      [Bcrypt Hashing]        │ │
│ │  ├─ auditUtils.cjs         [Action Logging]        │ │
│ │  ├─ permissionUtils.cjs    [RBAC Logic]            │ │
│ │  ├─ backupUtils.cjs        [Backup/Restore]        │ │
│ │  └─ validationUtils.cjs    [Input Validation]      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                     ┌─────▼────────┐
                     │ SQLite API   │
                     │ (better-     │
                     │  sqlite3)    │
                     └─────┬────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                            │
│                    (SQLite)                             │
├─────────────────────────────────────────────────────────┤
│  pos.db (Local Database)                                │
│  ├─ 9 Tables                                           │
│  ├─ Relationships & Constraints                        │
│  ├─ Transactions & Integrity                           │
│  └─ Backups in backups/ folder                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Permission System

```
┌─────────────────────────────────────────────────────────┐
│              ROLE-BASED ACCESS CONTROL                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👑 ADMIN (14 Permissions - All)                       │
│     ├─ users:create, users:read, users:update         │
│     ├─ users:delete                                   │
│     ├─ products:create, products:read, products:update│
│     ├─ products:delete                                │
│     ├─ invoices:create, invoices:read, invoices:update│
│     ├─ audit:read                                     │
│     └─ backup:create                                  │
│                                                         │
│  💼 MANAGER (8 Permissions)                            │
│     ├─ products:create, products:read, products:update│
│     ├─ invoices:create, invoices:read, invoices:update│
│     └─ audit:read                                     │
│                                                         │
│  📊 ACCOUNTANT (2 Permissions)                         │
│     ├─ invoices:read                                  │
│     └─ audit:read                                     │
│                                                         │
│  💳 CASHIER (3 Permissions)                            │
│     ├─ products:read                                  │
│     ├─ invoices:create                                │
│     └─ invoices:read                                  │
│                                                         │
│  📦 WAREHOUSE (3 Permissions)                          │
│     ├─ products:read                                  │
│     ├─ products:update                                │
│     └─ reservations:create                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 User Login Flow

```
Start: User enters credentials
  │
  ├─► 1. Validate Input
  │     └─ Check empty fields?
  │     └─ Check length?
  │
  ├─► 2. Query Database
  │     └─ SELECT * FROM users WHERE username = ?
  │
  ├─► 3. User Found?
  │     ├─ NO  → Log attempt → Show error → Repeat
  │     └─ YES → Continue
  │
  ├─► 4. Bcrypt Hash Compare
  │     └─ Compare(input_password, stored_hash)
  │
  ├─► 5. Match?
  │     ├─ NO  → Log failed attempt → Show error → Repeat
  │     └─ YES → Continue
  │
  ├─► 6. Load Permissions
  │     └─ SELECT permission FROM permissions WHERE role = ?
  │
  ├─► 7. Build Session
  │     └─ Store user_id, role, permissions in memory
  │
  ├─► 8. Log Success
  │     └─ INSERT INTO audit_logs (action='login', user_id, timestamp)
  │
  └─► 9. Redirect to Dashboard
      └─ User is authenticated, show main interface
```

---

## 💰 Invoice Creation Flow

```
Start: Cashier opens POS
  │
  ├─► 1. Load Products
  │     └─ SELECT * FROM products
  │
  ├─► 2. User Selects Product
  │     └─ Add to cart (in-memory array)
  │
  ├─► 3. More Items?
  │     ├─ YES → Go back to 2
  │     └─ NO → Continue
  │
  ├─► 4. Enter Customer Name
  │     └─ Get customer identifier
  │
  ├─► 5. Calculate Totals
  │     ├─ Subtotal = SUM(quantity * unit_price)
  │     ├─ Tax = subtotal * tax_rate
  │     └─ Total = subtotal + tax
  │
  ├─► 6. Choose Payment Type
  │     ├─ Full (pay all now)
  │     ├─ Partial (pay some, balance later)
  │     └─ Reservation (48-hour hold)
  │
  ├─► 7. Validate All Data
  │     ├─ Stock available?
  │     ├─ Amount valid?
  │     └─ No errors?
  │
  ├─► 8. Create Invoice (Database Transaction)
  │     ├─ INSERT invoices (customer, totals, status)
  │     ├─ INSERT invoice_items (product details)
  │     ├─ UPDATE products (reduce stock)
  │     ├─ INSERT payments (payment record)
  │     ├─ INSERT audit_logs (what happened)
  │     └─ COMMIT (all or nothing)
  │
  ├─► 9. Generate Invoice Number
  │     └─ Update invoice with unique number
  │
  ├─► 10. Show Success
  │      └─ Display invoice, print option
  │
  └─► 11. Clear Form
       └─ Ready for next invoice
```

---

## 🐛 Debug Checklist

```
┌─────────────────────────────────────────────────────────┐
│              DEBUGGING QUICK REFERENCE                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ❓ App Won't Start?                                   │
│    □ Node.js installed?  npm --version                │
│    □ npm install run?    node_modules exists?         │
│    □ Port 5173 free?     netstat -ano | findstr 5173  │
│    □ better-sqlite3 built?  npm run rebuild:native    │
│    └─► Try: npm run electron:dev                      │
│                                                         │
│  ❓ Can't Login?                                       │
│    □ Username correct?   Username: admin              │
│    □ Password correct?   Password: 123456             │
│    □ CAPS LOCK off?      Check keyboard               │
│    □ Check console       F12 → Console tab            │
│    └─► Look for error message in console              │
│                                                         │
│  ❓ Database Errors?                                   │
│    □ pos.db exists?      src/db/pos.db                │
│    □ File locked?        Close app completely         │
│    □ Delete and retry?   Delete pos.db, restart      │
│    └─► App recreates database on startup              │
│                                                         │
│  ❓ Invoice Won't Create?                              │
│    □ Permission check?   Check role permissions       │
│    □ Stock available?    Check product stock          │
│    □ Amount valid?       Check payment amount         │
│    □ Form validation?    Check all fields filled      │
│    └─► Check console error message                    │
│                                                         │
│  ❓ Permission Denied?                                 │
│    □ Logged in as?       Check user role              │
│    □ Role has access?    Check permissions matrix     │
│    □ Need admin?         Login as admin               │
│    └─► Check audit logs for denied attempts           │
│                                                         │
│  ❓ Performance Issue?                                 │
│    □ Too many records?   Database growing large       │
│    □ Close & restart?    Clear memory cache           │
│    □ Archive old data?   Delete old audit logs        │
│    └─► Consider: Archive strategy for old records     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 File Location Quick Reference

```
Project Root: e:\Work Freelancer\AwladElsaman\SystemApp\ReactPos\

Frontend Code:
  src/App.tsx                              Main app component
  src/pages/LoginPage.tsx                  Login screen
  src/pages/PosPage.tsx                    Invoice creation
  src/pages/ProductsPage.tsx               Product management
  src/pages/InvoicesPage.tsx               Invoice history
  src/pages/DashboardPage.tsx              Analytics
  src/pages/UserManagementPage.tsx         User admin
  src/pages/AuditLogPage.tsx               Audit trail
  src/api.ts                               40+ API methods
  src/types.ts                             TypeScript interfaces

Backend/Electron:
  electron/main.cjs                        Electron main
  electron/preload.cjs                     IPC bridge
  electron/sqlite.cjs                      Database API
  electron/utils/passwordUtils.cjs         Bcrypt
  electron/utils/auditUtils.cjs            Audit logging
  electron/utils/permissionUtils.cjs       Permission checks
  electron/utils/backupUtils.cjs           Backup/restore
  electron/utils/validationUtils.cjs       Data validation

Database:
  src/db/schema.sql                        Database structure
  src/db/pos.db                            SQLite database
  src/db/backups/                          Backup folder

Configuration:
  package.json                             Dependencies
  vite.config.ts                           Vite config
  tsconfig.json                            TypeScript config
  tailwind.config.js                       CSS config

Output:
  dist/                                    Built app
  dist/index.html                          React app HTML
  dist/assets/                             Bundled JS/CSS
```

---

## ⚡ Key Commands

```bash
# Development
npm install                                # Install dependencies
npm run electron:dev                       # Start dev server
npm run build                              # Build React app

# Maintenance  
npm run rebuild:native                     # Rebuild sqlite3
npm run electron:build                     # Create installer

# Testing
npm start                                  # Run app
node -e "require('better-sqlite3')"       # Test sqlite3
```

---

## 🎯 Quick Decision Tree

```
┌─ What are you doing?
│
├─► Developing new feature?
│   ├─ Check src/api.ts for similar methods
│   ├─ Check electron/sqlite.cjs for DB operations
│   └─ Follow existing pattern in codebase
│
├─► Debugging an issue?
│   ├─ Check console (F12) for errors
│   ├─ Check audit logs for actions
│   ├─ Try refreshing app (Ctrl+R)
│   └─ Delete pos.db and restart if corrupted
│
├─► Adding new page?
│   ├─ Create file in src/pages/PageName.tsx
│   ├─ Add route in src/App.tsx
│   ├─ Add permission checks
│   └─ Add menu item in Layout.tsx
│
├─► Changing database?
│   ├─ Edit src/db/schema.sql
│   ├─ Delete pos.db (will recreate)
│   ├─ Add migration in sqlite.cjs if needed
│   └─ Test thoroughly
│
├─► Distributing to users?
│   ├─ Run: npm run build
│   ├─ Run: npm run electron:build
│   ├─ Share: dist/ folder or .exe installer
│   └─ Users run: INSTALL_FIRST_TIME.bat
│
└─► Adding new role/permissions?
    ├─ Define permissions in schema.sql
    ├─ Check permission in permissionUtils.cjs
    ├─ Guard routes in App.tsx
    └─ Test all role access levels
```

---

## 🔍 File Change Impact Analysis

```
If you change...                    Then you must also check...
─────────────────────────────────────────────────────────
schema.sql                          DELETE pos.db, restart app
                                    Check foreign keys
                                    Update audit logging

types.ts                            All components importing types
                                    API calls returning typed data

api.ts                              React components calling API
                                    Electron handlers matching

App.tsx routes                      Layout menu items
                                    Permission guards

Permission system                   All pages checking access
                                    Audit log tracking

Electron handlers                   React API calls
                                    Parameter names matching

Password/Auth                       Login page validation
                                    Test all user types
```

---

**Version**: 1.0  
**Last Updated**: April 20, 2026  
**Status**: Production Ready - Phase 1 Complete


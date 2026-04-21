# 🏗️ AWLAD ELSAMAN POS - ARCHITECTURE DIAGRAMS

> Comprehensive visual documentation of project structure, data flow, and system architecture

---

## 1. 🎯 SYSTEM ARCHITECTURE OVERVIEW

```mermaid
graph TB
    subgraph "📱 Frontend Layer"
        React["React 19.2<br/>TypeScript<br/>Vite Build"]
        UI["UI Components<br/>Tailwind CSS<br/>Chart.js"]
        Router["React Router<br/>HashRouter"]
    end
    
    subgraph "🪟 Desktop Layer"
        Electron["Electron Main<br/>main.cjs"]
        Preload["Preload<br/>preload.cjs<br/>Context Bridge"]
        IPC["IPC Communication"]
    end
    
    subgraph "🔒 Security Layer"
        Auth["Authentication<br/>Bcrypt Hashing"]
        RBAC["RBAC System<br/>5 Roles<br/>27 Permissions"]
        Audit["Audit Logging<br/>All Actions"]
    end
    
    subgraph "💾 Data Layer"
        SQLite["SQLite Database<br/>pos.db"]
        Schema["9 Tables<br/>with Relations"]
        Validation["Data Validation<br/>Constraints"]
    end
    
    subgraph "🛠️ Utility Layer"
        Password["passwordUtils.cjs<br/>Bcrypt"]
        Backup["backupUtils.cjs<br/>Backup/Restore"]
        Permission["permissionUtils.cjs<br/>RBAC Logic"]
        Validation2["validationUtils.cjs<br/>Input Checks"]
        Audit2["auditUtils.cjs<br/>Logging"]
    end
    
    React --> Router
    Router --> UI
    UI --> IPC
    Electron --> Preload
    Preload --> IPC
    IPC --> Auth
    IPC --> RBAC
    Auth --> Password
    RBAC --> Permission
    SQLite --> Schema
    SQLite --> Validation
    Audit --> Audit2
    RBAC --> Audit
    Password --> SQLite
    Validation2 --> SQLite
```

---

## 2. 📊 DATABASE ENTITY RELATIONSHIP DIAGRAM (ERD)

```mermaid
erDiagram
    USERS ||--o{ INVOICES : "creates"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    USERS ||--o{ BACKUPS : "initiates"
    USERS ||--|| PERMISSIONS : "has_role"
    
    PRODUCTS ||--o{ INVOICE_ITEMS : "appears_in"
    PRODUCTS ||--o{ RESERVATIONS : "reserved_as"
    PRODUCTS ||--o{ AUDIT_LOGS : "modified_in"
    
    INVOICES ||--o{ INVOICE_ITEMS : "contains"
    INVOICES ||--o{ PAYMENTS : "receives"
    INVOICES ||--o{ AUDIT_LOGS : "recorded_in"
    
    PERMISSIONS ||--o{ USERS : "defines_access"
    
    USERS : int id PK
    USERS : string username UK
    USERS : string password_hash
    USERS : string email
    USERS : enum role
    USERS : bool is_active
    USERS : timestamp created_at
    
    PRODUCTS : int id PK
    PRODUCTS : string name
    PRODUCTS : string unit
    PRODUCTS : decimal price
    PRODUCTS : int stock
    PRODUCTS : timestamp created_at
    PRODUCTS : timestamp updated_at
    
    INVOICES : int id PK
    INVOICES : string invoice_number UK
    INVOICES : string customer_name
    INVOICES : decimal subtotal
    INVOICES : decimal tax_amount
    INVOICES : decimal total_amount
    INVOICES : decimal paid_amount
    INVOICES : enum status
    INVOICES : timestamp date
    
    INVOICE_ITEMS : int id PK
    INVOICE_ITEMS : int invoice_id FK
    INVOICE_ITEMS : int product_id FK
    INVOICE_ITEMS : string product_name
    INVOICE_ITEMS : int quantity
    INVOICE_ITEMS : decimal unit_price
    INVOICE_ITEMS : decimal line_total
    
    PAYMENTS : int id PK
    PAYMENTS : int invoice_id FK
    PAYMENTS : decimal amount
    PAYMENTS : timestamp date
    
    RESERVATIONS : int id PK
    RESERVATIONS : int product_id FK
    RESERVATIONS : int quantity
    RESERVATIONS : string customer_name
    RESERVATIONS : timestamp expiry_date
    RESERVATIONS : timestamp created_at
    
    AUDIT_LOGS : int id PK
    AUDIT_LOGS : int user_id FK
    AUDIT_LOGS : string action
    AUDIT_LOGS : string table_name
    AUDIT_LOGS : int record_id
    AUDIT_LOGS : string old_value
    AUDIT_LOGS : string new_value
    AUDIT_LOGS : timestamp timestamp
    
    PERMISSIONS : int id PK
    PERMISSIONS : string role
    PERMISSIONS : string permission
    PERMISSIONS : bool can_perform
    
    BACKUPS : int id PK
    BACKUPS : string backup_path
    BACKUPS : int backup_size
    BACKUPS : int created_by FK
    BACKUPS : timestamp created_at
    BACKUPS : timestamp restored_at
    BACKUPS : string description
    
    DATA_VALIDATION_LOGS : int id PK
    DATA_VALIDATION_LOGS : string table_name
    DATA_VALIDATION_LOGS : int record_id
    DATA_VALIDATION_LOGS : string field_name
    DATA_VALIDATION_LOGS : string error_message
    DATA_VALIDATION_LOGS : timestamp created_at
```

---

## 3. 🔐 USER AUTHENTICATION & PERMISSION FLOW

```mermaid
graph TD
    A["User Login"] --> B["Username & Password"]
    B --> C{"Validate<br/>Input"}
    C -->|Invalid| D["Show Error"]
    D --> A
    
    C -->|Valid| E["Query Database<br/>Find User"]
    E --> F{"User<br/>Found?"}
    F -->|No| G["Log Attempt<br/>Return Error"]
    G --> A
    
    F -->|Yes| H["Compare<br/>Bcrypt Hash"]
    H --> I{"Hash<br/>Match?"}
    I -->|No| J["Log Failed<br/>Attempt"]
    J --> A
    
    I -->|Yes| K["Load User Role"]
    K --> L["Query Permissions<br/>Table"]
    L --> M["Build Permission<br/>Matrix"]
    M --> N["Create Session"]
    N --> O["Log Successful<br/>Login"]
    O --> P["Redirect to<br/>Dashboard"]
    
    P --> Q{"Navigation<br/>Request"}
    Q --> R["Check User<br/>Permission"]
    R --> S{"Has<br/>Permission?"}
    S -->|No| T["Show Unauthorized"]
    S -->|Yes| U["Show Page"]
    
    U --> V["User Action<br/>on Page"]
    V --> W["API Call"]
    W --> X["Check Permission<br/>Again"]
    X --> Y{"Allowed?"}
    Y -->|No| Z["Reject & Log"]
    Y -->|Yes| AA["Execute Action<br/>& Log in Audit"]
```

---

## 4. 📝 INVOICE CREATION WORKFLOW

```mermaid
graph LR
    A["POS Page<br/>Load"] --> B["Display<br/>Products"]
    B --> C["User Selects<br/>Product"]
    C --> D["Add to<br/>Invoice"]
    D --> E{"Add More<br/>Items?"}
    E -->|Yes| C
    E -->|No| F["Enter Customer<br/>Name"]
    
    F --> G["Display<br/>Summary"]
    G --> H["Calculate<br/>Subtotal"]
    H --> I["Apply Tax"]
    I --> J["Calculate<br/>Total"]
    
    J --> K["Choose Payment<br/>Type"]
    K --> L{"Payment<br/>Type"}
    
    L -->|Full| M["Enter Payment"]
    L -->|Partial| N["Reserve<br/>Partial"]
    L -->|Reservation| O["Create<br/>48hr Hold"]
    
    M --> P["Validate<br/>Amount"]
    N --> P
    O --> P
    
    P --> Q{"Valid?"}
    Q -->|No| R["Show Error"]
    R --> K
    
    Q -->|Yes| S["Deduct Stock"]
    S --> T["Create Invoice<br/>in Database"]
    T --> U["Create Invoice<br/>Items"]
    U --> V["Create Payment<br/>Record"]
    V --> W["Log in<br/>Audit Trail"]
    W --> X["Generate<br/>Invoice #"]
    X --> Y["Show Success<br/>& Print"]
    Y --> Z["Clear Form<br/>Ready for Next"]
```

---

## 5. 📂 PROJECT FILE STRUCTURE WITH DEPENDENCIES

```mermaid
graph TD
    subgraph "Frontend"
        A["src/App.tsx"] -->|routes| B["src/pages/"]
        B --> C["LoginPage.tsx<br/>🔐 Auth"]
        B --> D["PosPage.tsx<br/>💰 Invoicing"]
        B --> E["ProductsPage.tsx<br/>📦 Products"]
        B --> F["InvoicesPage.tsx<br/>📋 History"]
        B --> G["DashboardPage.tsx<br/>📊 Analytics"]
        B --> H["UserManagementPage.tsx<br/>👥 Admin"]
        B --> I["AuditLogPage.tsx<br/>📝 Logs"]
        
        A -->|imports| J["src/api.ts<br/>40+ methods"]
        A -->|imports| K["src/types.ts<br/>Interfaces"]
        A -->|imports| L["src/components/"]
        L --> M["Layout.tsx<br/>Navigation"]
        L --> N["InvoiceDetailModal.tsx<br/>Detail View"]
        
        M --> O["src/style.css<br/>Tailwind"]
    end
    
    subgraph "Backend/Electron"
        P["electron/main.cjs"] -->|launches| Q["app entry"]
        P -->|creates| R["BrowserWindow"]
        P -->|loads| S["preload.cjs"]
        S -->|exposes| T["API Bridge<br/>ipcRenderer"]
        
        T -->|calls| U["electron/sqlite.cjs<br/>1297 lines"]
        U -->|uses| V["better-sqlite3"]
        U -->|manages| W["Database Operations"]
        
        U -->|calls| X["electron/utils/"]
        X --> Y["passwordUtils.cjs<br/>Bcrypt"]
        X --> Z["auditUtils.cjs<br/>Logging"]
        X --> AA["permissionUtils.cjs<br/>RBAC"]
        X --> AB["backupUtils.cjs<br/>Backup/Restore"]
        X --> AC["validationUtils.cjs<br/>Validation"]
    end
    
    subgraph "Data/Config"
        AD["src/db/"] -->|schema| AE["schema.sql"]
        AD -->|database| AF["pos.db"]
        AD -->|backups| AG["backups/"]
    end
    
    subgraph "Config Files"
        AH["package.json"] --> AI["Dependencies"]
        AJ["vite.config.ts"] --> AK["Build config"]
        AL["tsconfig.json"] --> AM["TS config"]
        AN["tailwind.config.js"] --> AO["CSS config"]
    end
    
    J -->|calls| U
    M -->|renders| C
    M -->|renders| D
    M -->|renders| E
    D -->|creates| AF
    Z -->|logs to| AF
    AA -->|checks| AF
    Y -->|hashes to| AF
```

---

## 6. 🔄 DATA FLOW: LOGIN TO DASHBOARD

```mermaid
sequenceDiagram
    participant User
    participant React as React UI
    participant IPC as Electron IPC
    participant API as sqlite.cjs
    participant DB as SQLite DB
    participant Utils as Utility Modules
    
    User ->> React: Click Login Button
    React ->> React: Validate Form
    React ->> IPC: Call login(username, pwd)
    
    IPC ->> API: Receive login request
    API ->> DB: Query users table
    DB -->> API: Return user record
    
    API ->> Utils: Call bcrypt.compare()
    Utils ->> Utils: Hash password
    Utils -->> API: Hash matches: true/false
    
    alt Password Matches
        API ->> Utils: Log successful login
        API ->> DB: Query permissions
        DB -->> API: Return permission list
        API ->> React: Return {ok: true, user, perms}
        React ->> React: Store user & perms
        React ->> React: Redirect to Dashboard
        React -->> User: Show Dashboard
    else Password Wrong
        API ->> Utils: Log failed attempt
        API -->> React: Return {ok: false, error}
        React -->> User: Show Error Message
    end
```

---

## 7. 🔄 DATA FLOW: INVOICE CREATION

```mermaid
sequenceDiagram
    participant User as Cashier
    participant PosPage as POS Page<br/>React
    participant IPC as Electron IPC
    participant API as sqlite.cjs
    participant Utils as Validation<br/>Utils
    participant DB as SQLite DB
    participant Audit as Audit Utils
    
    User ->> PosPage: Select Product
    PosPage ->> IPC: Add to invoice
    
    User ->> PosPage: Enter Qty & Customer
    PosPage ->> PosPage: Calculate total
    
    User ->> PosPage: Click Create Invoice
    PosPage ->> Utils: Validate all data
    Utils ->> Utils: Check stock, amounts
    Utils -->> PosPage: Validation OK
    
    PosPage ->> IPC: Create invoice
    IPC ->> API: Process invoice
    
    API ->> DB: START TRANSACTION
    API ->> DB: Insert invoice record
    API ->> DB: Insert invoice items
    API ->> DB: Deduct stock
    API ->> DB: Insert payment record
    
    API ->> Audit: Log action
    Audit ->> DB: Insert audit log
    
    API ->> DB: COMMIT
    API -->> IPC: Success + Invoice #
    IPC -->> PosPage: Return result
    PosPage -->> User: Show Success<br/>Print Invoice
```

---

## 8. 🎭 USER ROLES & PERMISSIONS MATRIX

```mermaid
graph TB
    subgraph "5 User Roles"
        ADMIN["👑 ADMIN"]
        MANAGER["💼 MANAGER"]
        ACCOUNTANT["📊 ACCOUNTANT"]
        CASHIER["💳 CASHIER"]
        WAREHOUSE["📦 WAREHOUSE"]
    end
    
    subgraph "Permission Categories"
        USERS["👥 Users<br/>Create, Read,<br/>Update, Delete"]
        PRODUCTS["📦 Products<br/>Create, Read,<br/>Update, Delete"]
        INVOICES["📋 Invoices<br/>Create, Read,<br/>Update"]
        AUDIT["📝 Audit<br/>Read"]
        BACKUP["💾 Backup<br/>Create, Restore"]
        RESERVATIONS["⏱️ Reservations<br/>Create, Read"]
    end
    
    ADMIN -.->|14 perms| USERS
    ADMIN -.->|14 perms| PRODUCTS
    ADMIN -.->|14 perms| INVOICES
    ADMIN -.->|14 perms| AUDIT
    ADMIN -.->|14 perms| BACKUP
    
    MANAGER -.->|8 perms| PRODUCTS
    MANAGER -.->|8 perms| INVOICES
    MANAGER -.->|8 perms| AUDIT
    
    ACCOUNTANT -.->|2 perms| INVOICES
    ACCOUNTANT -.->|2 perms| AUDIT
    
    CASHIER -.->|3 perms| PRODUCTS
    CASHIER -.->|3 perms| INVOICES
    
    WAREHOUSE -.->|3 perms| PRODUCTS
    WAREHOUSE -.->|3 perms| RESERVATIONS
    
    style ADMIN fill:#ff6b6b
    style MANAGER fill:#4ecdc4
    style ACCOUNTANT fill:#45b7d1
    style CASHIER fill:#96ceb4
    style WAREHOUSE fill:#ffeaa7
```

---

## 9. 🛡️ SECURITY LAYERS

```mermaid
graph TD
    subgraph "Layer 1: Frontend"
        A["User Input"]
        B["Type Validation<br/>TypeScript"]
        C["Form Validation<br/>React"]
        A --> B --> C
    end
    
    subgraph "Layer 2: IPC Communication"
        D["Preload Bridge<br/>Context Isolation"]
        E["IPC Listener<br/>Authorized Only"]
        C --> D --> E
    end
    
    subgraph "Layer 3: Authentication"
        F["User Query"]
        G["Bcrypt Compare<br/>10 salt rounds"]
        H["Session Creation"]
        E --> F --> G --> H
    end
    
    subgraph "Layer 4: Authorization"
        I["Check Permissions<br/>Matrix"]
        J["RBAC Rules"]
        K["Feature Access<br/>Control"]
        H --> I --> J --> K
    end
    
    subgraph "Layer 5: Data Validation"
        L["Input Validation<br/>Rules"]
        M["Business Logic<br/>Checks"]
        N["Database<br/>Constraints"]
        K --> L --> M --> N
    end
    
    subgraph "Layer 6: Audit Trail"
        O["Log All Actions"]
        P["Audit_Logs Table"]
        O --> P
    end
    
    subgraph "Layer 7: Data Protection"
        Q["Backups"]
        R["Foreign Keys"]
        S["Transactions"]
        P --> Q
        P --> R
        P --> S
    end
```

---

## 10. 📈 COMPONENT HIERARCHY

```mermaid
graph TD
    App["App.tsx<br/>Main Router"]
    
    App --> A["Layout.tsx<br/>Navigation Shell"]
    A --> B["Sidebar Menu"]
    A --> C["Main Content Area"]
    A --> D["Header"]
    
    App --> E["Route: /login"]
    E --> LoginPage["LoginPage.tsx<br/>Authentication"]
    
    App --> F["Route: /pos"]
    F --> PosPage["PosPage.tsx<br/>Invoice Creation"]
    PosPage --> ProductList["Product List"]
    PosPage --> InvoiceForm["Invoice Form"]
    PosPage --> PaymentOptions["Payment Options"]
    
    App --> G["Route: /invoices"]
    G --> InvoicesPage["InvoicesPage.tsx<br/>Invoice Management"]
    InvoicesPage --> InvoiceDetailModal["InvoiceDetailModal<br/>Detail View"]
    
    App --> H["Route: /products"]
    H --> ProductsPage["ProductsPage.tsx<br/>Product Management"]
    
    App --> I["Route: /dashboard"]
    I --> DashboardPage["DashboardPage.tsx<br/>Analytics"]
    
    App --> J["Route: /users"]
    J --> UserMgmtPage["UserManagementPage.tsx<br/>Admin Panel"]
    
    App --> K["Route: /audit"]
    K --> AuditPage["AuditLogPage.tsx<br/>Audit Trail"]
    
    style App fill:#667eea
    style A fill:#764ba2
    style LoginPage fill:#f093fb
    style PosPage fill:#4facfe
    style InvoicesPage fill:#00f2fe
    style ProductsPage fill:#43e97b
    style DashboardPage fill:#fa709a
    style UserMgmtPage fill:#fee140
    style AuditPage fill:#30b0fe
```

---

## 11. 🔧 ELECTRON PROCESS FLOW

```mermaid
graph TD
    A["npm start<br/>electron:dev"] --> B["Vite Dev Server<br/>Port 5173"]
    B --> C["React Hot Reload"]
    
    A --> D["Electron Main<br/>Process"]
    D --> E["Create Window"]
    E --> F["Load React App<br/>http://localhost:5173"]
    
    D --> G["Setup IPC<br/>Handlers"]
    G --> H["listen: auth:*"]
    G --> I["listen: user:*"]
    G --> J["listen: product:*"]
    G --> K["listen: invoice:*"]
    G --> L["listen: audit:*"]
    
    D --> M["Load Preload<br/>Script"]
    M --> N["Context Bridge"]
    N --> O["Expose API<br/>ipcRenderer"]
    
    C --> P["React Component"]
    P --> Q["call: api.method"]
    Q --> O
    O --> H
    H --> R["sqlite.cjs"]
    R --> S["SQLite DB"]
    S --> T["Data Operation"]
    T --> U["Return Result"]
    U --> O
    O --> P
    P --> V["Update UI"]
    
    style A fill:#9b59b6
    style D fill:#3498db
    style B fill:#2ecc71
    style S fill:#e74c3c
```

---

## 12. 🚀 BUILD & DEPLOYMENT FLOW

```mermaid
graph LR
    A["Development<br/>npm run<br/>electron:dev"] --> B["Source Files<br/>React + TS"]
    
    B --> C["npm run build<br/>React Build"]
    C --> D["Vite Output<br/>dist/ folder"]
    
    B --> E["npm run<br/>electron:build"]
    E --> F["Electron<br/>Builder"]
    F --> G["Windows<br/>.exe Installer"]
    F --> H["Portable<br/>.zip folder"]
    
    G --> I["User Installs<br/>INSTALL_FIRST_TIME.bat"]
    H --> J["User Extracts<br/>Folder"]
    
    I --> K["npm install<br/>User PC"]
    J --> L["Run<br/>START_APP_QUICK.bat"]
    K --> M["Database<br/>Initialized"]
    M --> N["App Ready"]
    
    L --> N
    N --> O["POS System<br/>Running"]
    
    style A fill:#3498db
    style D fill:#2ecc71
    style G fill:#27ae60
    style H fill:#27ae60
    style N fill:#f39c12
    style O fill:#c0392b
```

---

## 13. 🗂️ FOLDER STRUCTURE WITH LAYER MAPPING

```mermaid
graph TD
    ROOT["ReactPos/"]
    
    ROOT --> SRC["src/<br/>Frontend Layer"]
    SRC --> PAGES["pages/"]
    PAGES --> P1["LoginPage.tsx"]
    PAGES --> P2["PosPage.tsx"]
    PAGES --> P3["ProductsPage.tsx"]
    PAGES --> P4["InvoicesPage.tsx"]
    PAGES --> P5["DashboardPage.tsx"]
    PAGES --> P6["UserManagementPage.tsx"]
    PAGES --> P7["AuditLogPage.tsx"]
    
    SRC --> COMP["components/"]
    COMP --> C1["Layout.tsx"]
    COMP --> C2["InvoiceDetailModal.tsx"]
    
    SRC --> CORE["Core Files"]
    CORE --> APP["App.tsx"]
    CORE --> API["api.ts<br/>40+ methods"]
    CORE --> TYPES["types.ts<br/>Interfaces"]
    CORE --> STYLE["style.css"]
    
    SRC --> DB["db/"]
    DB --> SCHEMA["schema.sql<br/>9 tables"]
    DB --> POSDB["pos.db<br/>SQLite"]
    DB --> BACKUPS["backups/"]
    
    ROOT --> ELECTRON["electron/<br/>Desktop Layer"]
    ELECTRON --> MAIN["main.cjs"]
    ELECTRON --> PRELOAD["preload.cjs"]
    ELECTRON --> SQLITE["sqlite.cjs<br/>1297 lines"]
    
    ELECTRON --> UTILS["utils/<br/>Utility Layer"]
    UTILS --> U1["passwordUtils.cjs"]
    UTILS --> U2["auditUtils.cjs"]
    UTILS --> U3["permissionUtils.cjs"]
    UTILS --> U4["backupUtils.cjs"]
    UTILS --> U5["validationUtils.cjs"]
    
    ROOT --> DIST["dist/<br/>Built App"]
    DIST --> INDEX["index.html"]
    DIST --> ASSETS["assets/"]
    
    ROOT --> CONFIG["Configuration"]
    CONFIG --> PJ["package.json"]
    CONFIG --> TS["tsconfig.json"]
    CONFIG --> VITE["vite.config.ts"]
    CONFIG --> TAIL["tailwind.config.js"]
    
    style SRC fill:#3498db
    style ELECTRON fill:#e74c3c
    style UTILS fill:#f39c12
    style DB fill:#27ae60
    style CONFIG fill:#9b59b6
```

---

## 14. 📊 STATE MANAGEMENT FLOW

```mermaid
graph TD
    A["User Session<br/>React State"] --> B["User Object"]
    B --> C["ID, Username,<br/>Role, Email"]
    
    A --> D["Permissions Array"]
    D --> E["Loaded from<br/>DB on Login"]
    
    A --> F["Current Invoice<br/>Draft"]
    F --> G["Items Array"]
    G --> H["Product ID<br/>Qty, Price"]
    
    F --> I["Customer Info"]
    I --> J["Name, Total,<br/>Tax"]
    
    A --> K["UI State"]
    K --> L["Loading,<br/>Errors,<br/>Messages"]
    
    A --> M["Active Page"]
    M --> N["Current Route<br/>from Router"]
    
    O["API Calls"] -->|fetch| P["Database"]
    P -->|return| Q["Data"]
    Q -->|update| A
    
    A -->|check| R["Permission Guard"]
    R -->|allow/deny| S["Route Access"]
    
    A -->|check| T["UI Rendering"]
    T -->|show/hide| U["Components"]
    
    style A fill:#667eea
    style P fill:#e74c3c
    style R fill:#f39c12
    style S fill:#27ae60
```

---

## 15. 🔍 DEBUG & TROUBLESHOOTING REFERENCE

```mermaid
graph TD
    A["Debug Flow Chart"]
    
    A --> B{"App Won't<br/>Start?"}
    B -->|Yes| C["Check 1: Node.js<br/>Installed?"]
    C -->|No| D["Install Node.js"]
    C -->|Yes| E["Check 2: npm install<br/>Completed?"]
    E -->|No| F["Run: npm install"]
    E -->|Yes| G["Check 3: Port 5173<br/>Available?"]
    G -->|No| H["Kill process<br/>on port 5173"]
    G -->|Yes| I["Check 4: better-sqlite3<br/>Built?"]
    I -->|No| J["Run: npm run<br/>rebuild:native"]
    I -->|Yes| K["Try:<br/>npm run<br/>electron:dev"]
    
    A --> L{"Database<br/>Issues?"}
    L -->|Yes| M["Check: pos.db<br/>Exists?"]
    M -->|No| N["App creates<br/>on startup"]
    M -->|Yes| O["Delete pos.db"]
    O --> P["Restart App<br/>DB Recreated"]
    
    A --> Q{"Login<br/>Failed?"}
    Q -->|Yes| R["Check: Username<br/>admin"]
    R --> S["Check: Password<br/>123456"]
    S --> T["Check: Caps Lock"]
    T --> U["If still fails:<br/>Check console<br/>error"]
    
    A --> V{"Invoice<br/>Won't Create?"}
    V -->|Yes| W["Check 1:<br/>Permission?"]
    W --> X["Check 2:<br/>Stock?"]
    X --> Y["Check 3:<br/>Validation?"]
    Y --> Z["Check console<br/>for error"]
    
    style K fill:#27ae60
    style J fill:#f39c12
    style P fill:#27ae60
```

---

## 📋 QUICK LEGEND

| Symbol | Meaning |
|--------|---------|
| 🔐 | Security/Authentication |
| 💾 | Database/Storage |
| 📱 | Frontend/UI |
| 🪟 | Desktop/Electron |
| 🔧 | Utilities/Tools |
| 📊 | Data/Analytics |
| ⚙️ | Configuration |
| 🚀 | Deployment/Build |

---

## 🎯 HOW TO USE THESE DIAGRAMS

### For Development:
1. Reference **Diagram 1** (Architecture) for system overview
2. Check **Diagram 2** (ERD) when working with database
3. Use **Diagram 6** & **7** (Data Flow) when debugging
4. Reference **Diagram 12** (Build Flow) when deploying

### For Debugging:
1. Start with **Diagram 15** (Troubleshooting)
2. Use **Diagram 6** (Auth Flow) for login issues
3. Use **Diagram 7** (Invoice Flow) for data problems
4. Check **Diagram 11** (Electron) for app startup issues

### For New Features:
1. Use **Diagram 5** (File Structure) to find where to add files
2. Check **Diagram 10** (Component Hierarchy) for UI placement
3. Reference **Diagram 2** (ERD) for database changes
4. Update **Diagram 8** (Permissions) if new roles needed

### For Onboarding:
1. Start with **Diagram 1** (Overview)
2. Then **Diagram 8** (Roles)
3. Then **Diagram 6** & **7** (Workflows)
4. Reference **Diagram 13** (Folder Structure)

---

**Last Updated**: April 20, 2026  
**Version**: Phase 1.0 Complete  
**Status**: Production Ready


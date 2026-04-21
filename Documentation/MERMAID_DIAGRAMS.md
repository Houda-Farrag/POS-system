# 🎨 VISUAL DIAGRAMS - INTERACTIVE MERMAID REFERENCE

> Copy any diagram below and paste into: https://mermaid.live for live editing

---

## DIAGRAM 1: System Architecture Overview
[Copy to https://mermaid.live]

```
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

## DIAGRAM 2: User Authentication Flow
[Copy to https://mermaid.live]

```
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

## DIAGRAM 3: Invoice Creation Process
[Copy to https://mermaid.live]

```
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

## DIAGRAM 4: User Roles & Permissions
[Copy to https://mermaid.live]

```
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

## DIAGRAM 5: Component Hierarchy Tree
[Copy to https://mermaid.live]

```
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

## DIAGRAM 6: Electron Process Flow
[Copy to https://mermaid.live]

```
graph TD
    A["npm run electron:dev"] --> B["Vite Dev Server<br/>Port 5173"]
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

## DIAGRAM 7: Security Layers
[Copy to https://mermaid.live]

```
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

## DIAGRAM 8: Database Relationships (Simplified)
[Copy to https://mermaid.live]

```
graph TB
    Users["Users<br/>id, username, password_hash<br/>email, role, is_active"]
    Products["Products<br/>id, name, unit<br/>price, stock"]
    Invoices["Invoices<br/>id, invoice_number<br/>customer_name, total<br/>status, date"]
    InvoiceItems["Invoice Items<br/>id, invoice_id<br/>product_id, quantity<br/>unit_price, line_total"]
    Payments["Payments<br/>id, invoice_id<br/>amount, date"]
    Permissions["Permissions<br/>id, role<br/>permission, can_perform"]
    AuditLogs["Audit Logs<br/>id, user_id, action<br/>table_name, timestamp"]
    Reservations["Reservations<br/>id, product_id<br/>quantity, expiry_date"]
    Backups["Backups<br/>id, backup_path<br/>created_by, created_at"]
    
    Users -->|creates| Invoices
    Users -->|has| Permissions
    Users -->|triggers| AuditLogs
    
    Products -->|in| InvoiceItems
    Products -->|reserved| Reservations
    
    Invoices -->|has| InvoiceItems
    Invoices -->|receives| Payments
    
    InvoiceItems -->|for| Products
    
    style Users fill:#ff6b6b
    style Products fill:#4ecdc4
    style Invoices fill:#45b7d1
    style Permissions fill:#96ceb4
    style AuditLogs fill:#ffeaa7
```

---

## DIAGRAM 9: Data Flow - Login to Invoice
[Copy to https://mermaid.live]

```
sequenceDiagram
    participant User
    participant React
    participant IPC as Electron IPC
    participant API as sqlite.cjs
    participant DB as SQLite
    
    User ->> React: Enter Credentials
    React ->> IPC: login(username, pwd)
    IPC ->> API: Process login
    API ->> DB: Query users table
    DB -->> API: User record
    API ->> API: Bcrypt compare
    API -->> IPC: {ok: true, user, perms}
    IPC -->> React: Session created
    React -->> User: Show Dashboard
    
    User ->> React: Create Invoice
    React ->> IPC: createInvoice(data)
    IPC ->> API: Process invoice
    API ->> DB: Check stock
    API ->> DB: Insert invoice
    API ->> DB: Insert items
    API ->> DB: Deduct stock
    API ->> DB: Log audit
    API -->> IPC: {ok: true, invoiceId}
    IPC -->> React: Show success
    React -->> User: Invoice created
```

---

## DIAGRAM 10: Build & Deploy Flow
[Copy to https://mermaid.live]

```
graph LR
    A["Dev<br/>Code"] --> B["npm run<br/>build"]
    B --> C["dist/<br/>Built App"]
    
    A --> D["npm run<br/>electron:build"]
    D --> E["Windows<br/>.exe"]
    D --> F[".zip<br/>Portable"]
    
    E --> G["User<br/>Installs"]
    F --> H["User<br/>Extracts"]
    
    G --> I["Database<br/>Created"]
    H --> I
    
    I --> J["App<br/>Ready"]
    J --> K["Users<br/>Running<br/>POS"]
    
    style A fill:#3498db
    style C fill:#2ecc71
    style E fill:#27ae60
    style F fill:#27ae60
    style K fill:#c0392b
```

---

## DIAGRAM 11: File Structure Organization
[Copy to https://mermaid.live]

```
graph TD
    ROOT["ReactPos/"]
    
    ROOT --> SRC["src/"]
    SRC --> PAGES["pages/"]
    SRC --> COMP["components/"]
    SRC --> CORE["App.tsx, api.ts, types.ts"]
    SRC --> DB["db/ (schema.sql, pos.db)"]
    
    ROOT --> ELECTRON["electron/"]
    ELECTRON --> MAIN["main.cjs"]
    ELECTRON --> PRELOAD["preload.cjs"]
    ELECTRON --> SQLITE["sqlite.cjs"]
    ELECTRON --> UTILS["utils/"]
    UTILS --> U1["passwordUtils.cjs"]
    UTILS --> U2["auditUtils.cjs"]
    UTILS --> U3["permissionUtils.cjs"]
    UTILS --> U4["backupUtils.cjs"]
    UTILS --> U5["validationUtils.cjs"]
    
    ROOT --> DIST["dist/ (built app)"]
    
    ROOT --> CONFIG["Configuration Files"]
    CONFIG --> P1["package.json"]
    CONFIG --> P2["vite.config.ts"]
    CONFIG --> P3["tsconfig.json"]
    CONFIG --> P4["tailwind.config.js"]
    
    style SRC fill:#3498db
    style ELECTRON fill:#e74c3c
    style UTILS fill:#f39c12
    style DIST fill:#27ae60
    style CONFIG fill:#9b59b6
```

---

## DIAGRAM 12: Debugging Troubleshooting Tree
[Copy to https://mermaid.live]

```
graph TD
    A["⚠️ App Issues?"]
    
    A --> B{"App Won't<br/>Start?"}
    B -->|YES| C["Check: Node.js<br/>installed?"]
    C -->|NO| D["Install from<br/>nodejs.org"]
    C -->|YES| E["npm install"]
    E --> F["npm run<br/>electron:dev"]
    
    A --> G{"Login<br/>Failed?"}
    G -->|YES| H["Username: admin<br/>Password: 123456"]
    H --> I["Check console<br/>for error"]
    
    A --> J{"Database<br/>Error?"}
    J -->|YES| K["Delete pos.db"]
    K --> L["Restart app<br/>DB recreates"]
    
    A --> M{"Invoice Won't<br/>Create?"}
    M -->|YES| N["Check: Permission?<br/>Stock? Validation?"]
    N --> O["Check console<br/>error message"]
    
    style A fill:#e74c3c
    style F fill:#27ae60
    style L fill:#27ae60
    style O fill:#f39c12
```

---

## 📚 LEGEND & SYMBOLS

```
📱 = Frontend/UI
🪟 = Electron/Desktop
🔒 = Security
💾 = Database
🛠️ = Utilities
📊 = Data/Analytics
⚙️ = Configuration
🚀 = Deployment
🔧 = Tools
```

---

## 🎯 QUICK NAVIGATION

| Need | Diagram |
|------|---------|
| System Overview | #1 |
| Login Flow | #2 |
| Invoice Creation | #3 |
| Permissions | #4 |
| UI Components | #5 |
| Electron Process | #6 |
| Security | #7 |
| Database | #8 |
| Data Flow | #9 |
| Deployment | #10 |
| Files | #11 |
| Debugging | #12 |

---

**Version**: 1.0  
**Last Updated**: April 20, 2026  
**Use**: Copy diagrams to https://mermaid.live for interactive visualization


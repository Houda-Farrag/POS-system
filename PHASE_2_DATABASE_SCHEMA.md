# 🗄️ PHASE 2 DATABASE SCHEMA

This file contains the SQL for all 17 new tables for Phase 2 features.

---

## 📋 TABLE OVERVIEW

```
PHASE 1 (Existing): 9 tables
PHASE 2 (New):     17 tables
TOTAL:             26 tables
```

---

## 🛒 PURCHASES MODULE (5 Tables)

### 1. SUPPLIERS TABLE

```sql
CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  payment_terms TEXT,
  tax_id TEXT,
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Example Data
INSERT OR IGNORE INTO suppliers (id, name, contact_person, email, phone, city) VALUES
  (1, 'Supplier A', 'Ahmed', 'ahmed@supplier.com', '01234567890', 'Cairo'),
  (2, 'Supplier B', 'Ali', 'ali@supplier.com', '01234567891', 'Giza');
```

### 2. PURCHASE_ORDERS TABLE

```sql
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  po_number TEXT UNIQUE,
  supplier_id INTEGER NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  expected_delivery DATETIME,
  actual_delivery DATETIME,
  subtotal REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  total_amount REAL DEFAULT 0,
  status TEXT CHECK(status IN ('draft', 'submitted', 'received', 'cancelled')) DEFAULT 'draft',
  created_by INTEGER,
  notes TEXT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
```

### 3. PURCHASE_ITEMS TABLE

```sql
CREATE TABLE IF NOT EXISTS purchase_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_price REAL NOT NULL,
  line_total REAL NOT NULL,
  received_qty INTEGER DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_pi_po ON purchase_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_pi_product ON purchase_items(product_id);
```

### 4. GOODS_RECEIVED TABLE

```sql
CREATE TABLE IF NOT EXISTS goods_received (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_order_id INTEGER NOT NULL,
  received_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  received_by INTEGER NOT NULL,
  total_items INTEGER,
  damaged_items INTEGER DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (received_by) REFERENCES users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_gr_po ON goods_received(purchase_order_id);
```

### 5. SUPPLIER_PAYMENTS TABLE

```sql
CREATE TABLE IF NOT EXISTS supplier_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_order_id INTEGER NOT NULL,
  supplier_id INTEGER NOT NULL,
  amount_paid REAL NOT NULL,
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_method TEXT CHECK(payment_method IN ('cash', 'check', 'bank_transfer', 'credit')),
  reference_number TEXT,
  notes TEXT,
  created_by INTEGER,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_sp_supplier ON supplier_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_sp_po ON supplier_payments(purchase_order_id);
```

---

## 👥 CUSTOMER PROFILES (4 Tables)

### 6. CUSTOMERS TABLE

```sql
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  customer_type TEXT CHECK(customer_type IN ('retail', 'wholesale', 'contractor', 'corporate')),
  credit_limit REAL DEFAULT 0,
  tax_id TEXT,
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Example Data
INSERT OR IGNORE INTO customers (id, name, email, phone, customer_type, credit_limit) VALUES
  (1, 'Main Store', 'store@mail.com', '01234567890', 'retail', 50000),
  (2, 'Contractor ABC', 'contractor@mail.com', '01234567891', 'contractor', 100000);
```

### 7. CUSTOMER_PRICING TABLE

```sql
CREATE TABLE IF NOT EXISTS customer_pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  custom_price REAL NOT NULL,
  discount_percent REAL DEFAULT 0,
  minimum_qty INTEGER DEFAULT 1,
  valid_from DATETIME,
  valid_to DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE(customer_id, product_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_cp_customer ON customer_pricing(customer_id);
```

### 8. CUSTOMER_CREDITS TABLE

```sql
CREATE TABLE IF NOT EXISTS customer_credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL UNIQUE,
  credit_limit REAL NOT NULL,
  credit_used REAL DEFAULT 0,
  credit_available REAL,
  last_payment_date DATETIME,
  payment_terms_days INTEGER DEFAULT 30,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_cc_customer ON customer_credits(customer_id);
```

### 9. CUSTOMER_TRANSACTIONS TABLE

```sql
CREATE TABLE IF NOT EXISTS customer_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  invoice_id INTEGER,
  transaction_type TEXT CHECK(transaction_type IN ('sale', 'payment', 'adjustment')),
  amount REAL NOT NULL,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  balance_after REAL,
  notes TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ct_customer ON customer_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_ct_invoice ON customer_transactions(invoice_id);
```

---

## 💰 DAILY RECONCILIATION (3 Tables)

### 10. DAILY_RECONCILIATION TABLE

```sql
CREATE TABLE IF NOT EXISTS daily_reconciliation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reconciliation_date DATE UNIQUE,
  opening_balance REAL,
  closing_balance REAL,
  expected_balance REAL,
  cash_count REAL,
  variance REAL,
  variance_notes TEXT,
  status TEXT CHECK(status IN ('pending', 'completed', 'approved')) DEFAULT 'pending',
  closed_by INTEGER,
  approved_by INTEGER,
  closed_at DATETIME,
  approved_at DATETIME,
  FOREIGN KEY (closed_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_dr_date ON daily_reconciliation(reconciliation_date);
CREATE INDEX IF NOT EXISTS idx_dr_status ON daily_reconciliation(status);
```

### 11. CASH_COUNTS TABLE

```sql
CREATE TABLE IF NOT EXISTS cash_counts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  daily_reconciliation_id INTEGER NOT NULL,
  cashier_id INTEGER,
  denomination INTEGER,
  quantity INTEGER NOT NULL,
  subtotal REAL,
  counted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daily_reconciliation_id) REFERENCES daily_reconciliation(id) ON DELETE CASCADE,
  FOREIGN KEY (cashier_id) REFERENCES users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_cc_reconciliation ON cash_counts(daily_reconciliation_id);
```

### 12. RECONCILIATION_LOGS TABLE

```sql
CREATE TABLE IF NOT EXISTS reconciliation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  daily_reconciliation_id INTEGER NOT NULL,
  log_type TEXT CHECK(log_type IN ('adjustment', 'note', 'approval')),
  description TEXT,
  amount REAL DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daily_reconciliation_id) REFERENCES daily_reconciliation(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_rl_reconciliation ON reconciliation_logs(daily_reconciliation_id);
```

---

## 👨‍💼 EMPLOYEE MANAGEMENT (5 Tables)

### 13. EMPLOYEES TABLE

```sql
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  hire_date DATE,
  position TEXT,
  department TEXT,
  salary REAL,
  commission_rate REAL DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_emp_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_emp_active ON employees(is_active);
```

### 14. SHIFTS TABLE

```sql
CREATE TABLE IF NOT EXISTS shifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shift_name TEXT NOT NULL UNIQUE,
  start_time TEXT,
  end_time TEXT,
  hours_per_day REAL,
  is_active INTEGER DEFAULT 1
);

-- Example Data
INSERT OR IGNORE INTO shifts (id, shift_name, start_time, end_time, hours_per_day) VALUES
  (1, 'Morning', '08:00', '16:00', 8),
  (2, 'Evening', '16:00', '00:00', 8),
  (3, 'Night', '00:00', '08:00', 8);
```

### 15. ATTENDANCE TABLE

```sql
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  attendance_date DATE,
  shift_id INTEGER,
  check_in_time DATETIME,
  check_out_time DATETIME,
  hours_worked REAL,
  status TEXT CHECK(status IN ('present', 'absent', 'leave', 'half_day')) DEFAULT 'present',
  notes TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  UNIQUE(employee_id, attendance_date)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_att_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_att_date ON attendance(attendance_date);
```

### 16. COMMISSIONS TABLE

```sql
CREATE TABLE IF NOT EXISTS commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  commission_period_start DATE,
  commission_period_end DATE,
  total_sales REAL,
  commission_rate REAL,
  commission_amount REAL,
  status TEXT CHECK(status IN ('calculated', 'approved', 'paid')) DEFAULT 'calculated',
  paid_date DATETIME,
  notes TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_comm_employee ON commissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_comm_status ON commissions(status);
```

### 17. EMPLOYEE_PERFORMANCE TABLE

```sql
CREATE TABLE IF NOT EXISTS employee_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL UNIQUE,
  total_invoices INTEGER DEFAULT 0,
  total_sales_amount REAL DEFAULT 0,
  avg_invoice_value REAL DEFAULT 0,
  total_commission_earned REAL DEFAULT 0,
  attendance_rate REAL DEFAULT 0,
  customer_satisfaction_score REAL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_perf_employee ON employee_performance(employee_id);
```

---

## 🔑 FOREIGN KEY RELATIONSHIPS MAP

```
New Relationships:

Purchase Module:
  purchase_orders.supplier_id → suppliers.id
  purchase_items.purchase_order_id → purchase_orders.id
  purchase_items.product_id → products.id
  goods_received.purchase_order_id → purchase_orders.id
  supplier_payments.purchase_order_id → purchase_orders.id
  supplier_payments.supplier_id → suppliers.id

Customer Module:
  customer_pricing.customer_id → customers.id
  customer_pricing.product_id → products.id
  customer_credits.customer_id → customers.id
  customer_transactions.customer_id → customers.id
  customer_transactions.invoice_id → invoices.id

Reconciliation Module:
  cash_counts.daily_reconciliation_id → daily_reconciliation.id
  reconciliation_logs.daily_reconciliation_id → daily_reconciliation.id

Employee Module:
  employees.user_id → users.id
  attendance.employee_id → employees.id
  attendance.shift_id → shifts.id
  commissions.employee_id → employees.id
  employee_performance.employee_id → employees.id
```

---

## 🔐 NEW PERMISSIONS TO ADD

```sql
-- Purchases Module (6 permissions)
INSERT OR IGNORE INTO permissions (role, permission, can_perform) VALUES
  ('admin', 'purchases:create', 1),
  ('admin', 'purchases:read', 1),
  ('admin', 'purchases:update', 1),
  ('admin', 'purchases:delete', 1),
  ('admin', 'suppliers:manage', 1),
  ('admin', 'payments:record', 1),
  
  ('manager', 'purchases:create', 1),
  ('manager', 'purchases:read', 1),
  ('manager', 'purchases:update', 1),
  ('manager', 'suppliers:manage', 1),
  ('manager', 'payments:record', 1);

-- Customers Module (5 permissions)
INSERT OR IGNORE INTO permissions (role, permission, can_perform) VALUES
  ('admin', 'customers:create', 1),
  ('admin', 'customers:read', 1),
  ('admin', 'customers:update', 1),
  ('admin', 'customers:delete', 1),
  ('admin', 'credits:manage', 1),
  
  ('manager', 'customers:read', 1),
  ('manager', 'customers:update', 1),
  ('manager', 'credits:manage', 1),
  
  ('cashier', 'customers:read', 1);

-- Reconciliation Module (4 permissions)
INSERT OR IGNORE INTO permissions (role, permission, can_perform) VALUES
  ('admin', 'reconciliation:create', 1),
  ('admin', 'reconciliation:approve', 1),
  ('admin', 'reconciliation:view', 1),
  ('admin', 'reconciliation:adjust', 1),
  
  ('manager', 'reconciliation:view', 1),
  ('manager', 'reconciliation:adjust', 1),
  
  ('cashier', 'reconciliation:create', 1);

-- Employees Module (6 permissions)
INSERT OR IGNORE INTO permissions (role, permission, can_perform) VALUES
  ('admin', 'employees:manage', 1),
  ('admin', 'shifts:manage', 1),
  ('admin', 'attendance:view', 1),
  ('admin', 'attendance:record', 1),
  ('admin', 'commissions:manage', 1),
  ('admin', 'performance:view', 1),
  
  ('manager', 'attendance:view', 1),
  ('manager', 'attendance:record', 1),
  ('manager', 'performance:view', 1);
```

---

## 📊 TOTAL SCHEMA STATISTICS

### Tables:
- Phase 1: 9 tables
- Phase 2: 17 tables
- **Total: 26 tables**

### Columns:
- Phase 1: ~80 columns
- Phase 2: ~130 columns
- **Total: ~210 columns**

### Relationships:
- Phase 1: 12 foreign keys
- Phase 2: 25 foreign keys
- **Total: 37 foreign keys**

### Indexes:
- Phase 1: 0 indexes
- Phase 2: 20+ indexes
- **Total: 20+ indexes for performance**

---

## 🔄 DATA MIGRATION NOTES

### When Adding Phase 2:

1. **Backup Current Database**
   ```bash
   copy src/db/pos.db src/db/pos.db.backup.phase1
   ```

2. **Run New Schema**
   - Add new CREATE TABLE statements
   - Add new indexes
   - Add new permissions

3. **Update Existing Tables**
   ```sql
   -- Update invoices to link to customers (optional)
   ALTER TABLE invoices ADD COLUMN customer_id INTEGER;
   ALTER TABLE invoices ADD FOREIGN KEY (customer_id) REFERENCES customers(id);
   
   -- Link invoices to employees (optional)
   ALTER TABLE invoices ADD COLUMN employee_id INTEGER;
   ALTER TABLE invoices ADD FOREIGN KEY (employee_id) REFERENCES employees(id);
   ```

4. **Test**
   - Verify all relationships
   - Test constraints
   - Verify indexes work

---

## 💡 IMPLEMENTATION ORDER

**Week 1**: Purchases (Tables 1-5 + Permissions)  
**Week 2**: Customers (Tables 6-9 + Permissions)  
**Week 3**: Reconciliation (Tables 10-12 + Permissions)  
**Week 4**: Employees (Tables 13-17 + Permissions)  

---

**Status**: Schema Design Complete  
**Next Step**: Implement Purchases Module Tables


CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  unit TEXT,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE,
  customer_name TEXT,
  subtotal REAL NOT NULL,
  tax_rate REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  paid_amount REAL DEFAULT 0,
  status TEXT CHECK(status IN ('unpaid', 'partial', 'paid')),
  date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  line_total REAL NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  customer_name TEXT,
  expiry_date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT CHECK(role IN ('admin', 'manager', 'accountant', 'cashier', 'warehouse')) DEFAULT 'cashier',
  display_name TEXT,
  is_active INTEGER DEFAULT 1,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id INTEGER,
  old_value TEXT,
  new_value TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  can_perform INTEGER DEFAULT 1,
  UNIQUE(role, permission)
);

CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_path TEXT NOT NULL,
  backup_size INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  restored_at DATETIME,
  description TEXT
);

CREATE TABLE IF NOT EXISTS data_validation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT,
  record_id INTEGER,
  field_name TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========== PHASE 2: PURCHASES MODULE TABLES ==========

-- Suppliers
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

-- Purchase Orders
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

CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);

-- Purchase Items
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

CREATE INDEX IF NOT EXISTS idx_pi_po ON purchase_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_pi_product ON purchase_items(product_id);

-- Goods Received
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

CREATE INDEX IF NOT EXISTS idx_gr_po ON goods_received(purchase_order_id);

-- Supplier Payments
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

CREATE INDEX IF NOT EXISTS idx_sp_supplier ON supplier_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_sp_po ON supplier_payments(purchase_order_id);

-- ========== END PHASE 2: PURCHASES MODULE TABLES ==========

INSERT OR IGNORE INTO users (id, username, password_hash, email, role, display_name, is_active, created_by) VALUES
  (1, 'admin', '$2a$10$Z3aBr91ldM8LNs6BTVg2vu86S1O3XaXmpLVe78eENreux460Oppsy', 'admin@awladelsaman.com', 'admin', 'Admin', 1, 1),
  (2, 'cashier1', '$2a$10$Z3aBr91ldM8LNs6BTVg2vu86S1O3XaXmpLVe78eENreux460Oppsy', 'cashier@awladelsaman.com', 'cashier', 'Cashier', 1, 1),
  (3, 'accountant1', '$2a$10$Z3aBr91ldM8LNs6BTVg2vu86S1O3XaXmpLVe78eENreux460Oppsy', 'accountant@awladelsaman.com', 'accountant', 'Accountant', 1, 1),
  (4, 'manager1', '$2a$10$Z3aBr91ldM8LNs6BTVg2vu86S1O3XaXmpLVe78eENreux460Oppsy', 'manager@awladelsaman.com', 'manager', 'Manager', 1, 1);

INSERT OR IGNORE INTO permissions (role, permission, can_perform) VALUES
  ('admin', 'users:create', 1),
  ('admin', 'users:read', 1),
  ('admin', 'users:update', 1),
  ('admin', 'users:delete', 1),
  ('admin', 'products:create', 1),
  ('admin', 'products:read', 1),
  ('admin', 'products:update', 1),
  ('admin', 'products:delete', 1),
  ('admin', 'invoices:create', 1),
  ('admin', 'invoices:read', 1),
  ('admin', 'invoices:update', 1),
  ('admin', 'audit:read', 1),
  ('admin', 'backup:create', 1),
  ('admin', 'purchases:create', 1),
  ('admin', 'purchases:read', 1),
  ('admin', 'purchases:update', 1),
  ('admin', 'purchases:delete', 1),
  ('admin', 'suppliers:manage', 1),
  ('admin', 'payments:record', 1),
  ('manager', 'products:create', 1),
  ('manager', 'products:read', 1),
  ('manager', 'products:update', 1),
  ('manager', 'invoices:create', 1),
  ('manager', 'invoices:read', 1),
  ('manager', 'audit:read', 1),
  ('manager', 'purchases:create', 1),
  ('manager', 'purchases:read', 1),
  ('manager', 'purchases:update', 1),
  ('manager', 'suppliers:manage', 1),
  ('manager', 'payments:record', 1),
  ('accountant', 'invoices:read', 1),
  ('accountant', 'audit:read', 1),
  ('accountant', 'purchases:read', 1),
  ('accountant', 'payments:record', 1),
  ('cashier', 'products:read', 1),
  ('cashier', 'invoices:create', 1),
  ('cashier', 'invoices:read', 1),
  ('cashier', 'purchases:read', 1),
  ('warehouse', 'products:read', 1),
  ('warehouse', 'products:update', 1),
  ('warehouse', 'reservations:create', 1),
  ('warehouse', 'purchases:read', 1);

INSERT OR IGNORE INTO products (id, name, unit, price, stock) VALUES
  (1, 'اسمنت', '50kg bag', 8.50, 200),
  (2, 'طوب احمر', 'piece', 0.45, 5000),
  (3, 'صلب 12mm', '6m length', 12.00, 150);

-- Sample suppliers for Phase 2
INSERT OR IGNORE INTO suppliers (id, name, contact_person, email, phone, city, payment_terms) VALUES
  (1, 'Supplier A', 'Ahmed', 'ahmed@supplier.com', '01234567890', 'Cairo', '30 days'),
  (2, 'Supplier B', 'Ali', 'ali@supplier.com', '01234567891', 'Giza', '15 days');

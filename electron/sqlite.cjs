const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { app } = require("electron"); // ADD THIS LINE
const { passwordUtils } = require("./utils/passwordUtils.cjs");
const { auditUtils } = require("./utils/auditUtils.cjs");
const { permissionUtils } = require("./utils/permissionUtils.cjs");
const { backupUtils } = require("./utils/backupUtils.cjs");
const { validationUtils } = require("./utils/validationUtils.cjs");

// ===== FIXED: Use userData for production, cwd for development =====
let dbPath, seedPath, backupDir;

if (app.isPackaged) {
  // Production: Use userData directory (writable)
  const userDataPath = app.getPath("userData");
  const dbDir = path.join(userDataPath, "database");
  dbPath = path.join(dbDir, "pos.db");
  backupDir = path.join(userDataPath, "backups");
  seedPath = path.join(process.resourcesPath, "src", "db", "schema.sql");
  console.log("Production mode - Database path:", dbPath);
} else {
  // Development: Use project directory
  dbPath = path.join(process.cwd(), "src", "db", "pos.db");
  seedPath = path.join(process.cwd(), "src", "db", "schema.sql");
  backupDir = path.join(process.cwd(), "src", "db", "backups");
  console.log("Development mode - Database path:", dbPath);
}

let db;
let currentUser = null;

function ensureDb() {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log("Created database directory at:", dbDir);
  }

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log("Created backup directory at:", backupDir);
  }

  db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
}

function migrateDatabase() {
  try {
    // Check if password column exists (old schema)
    const userTable = db.prepare("PRAGMA table_info(users)").all();
    const hasPasswordColumn = userTable.some((col) => col.name === "password");
    const hasPasswordHashColumn = userTable.some(
      (col) => col.name === "password_hash",
    );

    if (hasPasswordColumn && !hasPasswordHashColumn) {
      console.log("Migrating database from old schema to new schema...");

      // Start transaction
      db.prepare("BEGIN TRANSACTION").run();

      try {
        // Add new columns if they don't exist
        const columns = userTable.map((col) => col.name);

        if (!columns.includes("password_hash")) {
          db.prepare("ALTER TABLE users ADD COLUMN password_hash TEXT").run();
        }
        if (!columns.includes("email")) {
          db.prepare("ALTER TABLE users ADD COLUMN email TEXT").run();
        }
        if (!columns.includes("is_active")) {
          db.prepare(
            "ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1",
          ).run();
        }
        if (!columns.includes("created_by")) {
          db.prepare("ALTER TABLE users ADD COLUMN created_by INTEGER").run();
        }
        if (!columns.includes("created_at")) {
          db.prepare(
            "ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
          ).run();
        }
        if (!columns.includes("updated_at")) {
          db.prepare(
            "ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
          ).run();
        }

        // Migrate passwords to hashes
        const users = db
          .prepare("SELECT id, password FROM users WHERE password IS NOT NULL")
          .all();
        for (const user of users) {
          const hash = passwordUtils.hashPassword(user.password);
          db.prepare(
            "UPDATE users SET password_hash = ?, password = NULL WHERE id = ?",
          ).run(hash, user.id);
        }

        // Update roles if using old 3-role system
        db.prepare(
          "UPDATE users SET role = 'admin' WHERE role = 'stakeholder'",
        ).run();

        // Create missing tables
        const tables = db
          .prepare("SELECT name FROM sqlite_master WHERE type='table'")
          .all()
          .map((t) => t.name);

        if (!tables.includes("audit_logs")) {
          db.prepare(
            `CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            table_name TEXT,
            record_id INTEGER,
            old_value TEXT,
            new_value TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )`,
          ).run();
        }

        if (!tables.includes("permissions")) {
          db.prepare(
            `CREATE TABLE IF NOT EXISTS permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            permission TEXT NOT NULL,
            can_perform INTEGER DEFAULT 1,
            UNIQUE(role, permission)
          )`,
          ).run();

          // Insert default permissions
          const permissions = [
            ["admin", "users:create", 1],
            ["admin", "users:read", 1],
            ["admin", "users:update", 1],
            ["admin", "users:delete", 1],
            ["admin", "products:create", 1],
            ["admin", "products:read", 1],
            ["admin", "products:update", 1],
            ["admin", "products:delete", 1],
            ["admin", "invoices:create", 1],
            ["admin", "invoices:read", 1],
            ["admin", "invoices:update", 1],
            ["admin", "audit:read", 1],
            ["admin", "backup:create", 1],
            ["manager", "products:create", 1],
            ["manager", "products:read", 1],
            ["manager", "products:update", 1],
            ["manager", "invoices:create", 1],
            ["manager", "invoices:read", 1],
            ["manager", "audit:read", 1],
            ["accountant", "invoices:read", 1],
            ["accountant", "audit:read", 1],
            ["cashier", "products:read", 1],
            ["cashier", "invoices:create", 1],
            ["cashier", "invoices:read", 1],
            ["warehouse", "products:read", 1],
            ["warehouse", "products:update", 1],
            ["warehouse", "reservations:create", 1],
          ];

          const permStmt = db.prepare(
            "INSERT OR IGNORE INTO permissions (role, permission, can_perform) VALUES (?, ?, ?)",
          );
          for (const perm of permissions) {
            permStmt.run(...perm);
          }
        }

        if (!tables.includes("backups")) {
          db.prepare(
            `CREATE TABLE IF NOT EXISTS backups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            backup_path TEXT NOT NULL,
            backup_size INTEGER,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            restored_at DATETIME,
            description TEXT
          )`,
          ).run();
        }

        if (!tables.includes("data_validation_logs")) {
          db.prepare(
            `CREATE TABLE IF NOT EXISTS data_validation_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT,
            record_id INTEGER,
            field_name TEXT,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
          ).run();
        }

        db.prepare("COMMIT").run();
        console.log("Database migration completed successfully");
      } catch (err) {
        db.prepare("ROLLBACK").run();
        throw err;
      }
    }
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
}

// Replace the seedPath reading with embedded schema
function getSchemaSQL() {
  return `
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

  `;
}

const dbApi = {
  init() {
    // ensureDb();

    // // Check if database is new or existing
    // const tables = db
    //   .prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'")
    //   .get();

    // if (tables.count === 0) {
    //   // New database - run full schema
    //   console.log("Initializing new database...");
    //   const sql = fs.readFileSync(seedPath, "utf8");
    //   db.exec(sql);
    // } else {
    //   // Existing database - run migration
    //   migrateDatabase();
    // }
    ensureDb();

    const tables = db
      .prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'")
      .get();

    if (tables.count === 0) {
      console.log("Initializing new database...");
      const sql = getSchemaSQL(); // Use embedded schema
      db.exec(sql);
    } else {
      migrateDatabase();
    }
  },

  // ===== AUTHENTICATION & USER MANAGEMENT =====

  login(username, password) {
    try {
      const user = db
        .prepare(
          "SELECT id, username, email, role, display_name, is_active FROM users WHERE username = ? AND is_active = 1",
        )
        .get(username);

      if (!user) {
        auditUtils.logAction(
          db,
          null,
          "login_failed",
          "users",
          null,
          null,
          `Login failed for username: ${username}`,
        );
        return null;
      }

      const passwordHash = db
        .prepare("SELECT password_hash FROM users WHERE id = ?")
        .get(user.id).password_hash;

      if (!passwordUtils.verifyPassword(password, passwordHash)) {
        auditUtils.logAction(db, user.id, "login_failed", "users", user.id);
        return null;
      }

      currentUser = user;
      auditUtils.logAction(db, user.id, "login_success", "users", user.id);
      return user;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },

  logout() {
    if (currentUser) {
      auditUtils.logAction(
        db,
        currentUser.id,
        "logout",
        "users",
        currentUser.id,
      );
      currentUser = null;
    }
  },

  getCurrentUser() {
    return currentUser;
  },

  createUser(payload) {
    try {
      if (
        !currentUser ||
        !permissionUtils.userCan(db, currentUser, "users:create")
      ) {
        return { ok: false, error: "Permission denied" };
      }

      // Validation
      const usernameValidation = validationUtils.isValidUsername(
        payload.username,
      );
      if (!usernameValidation.valid) {
        return { ok: false, error: usernameValidation.error };
      }

      const emailValidation = validationUtils.isValidEmail(payload.email);
      if (!emailValidation) {
        return { ok: false, error: "Invalid email format" };
      }

      const passwordValidation = passwordUtils.validatePasswordStrength(
        payload.password,
      );
      if (!passwordValidation.isStrong) {
        return {
          ok: false,
          error: `Weak password: ${passwordValidation.errors.join(", ")}`,
        };
      }

      // Check if username exists
      const existing = db
        .prepare("SELECT id FROM users WHERE username = ?")
        .get(payload.username);
      if (existing) {
        return { ok: false, error: "Username already exists" };
      }

      const passwordHash = passwordUtils.hashPassword(payload.password);
      const stmt = db.prepare(`
        INSERT INTO users (username, password_hash, email, role, display_name, is_active, created_by)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `);

      const result = stmt.run(
        payload.username,
        passwordHash,
        payload.email,
        payload.role,
        payload.display_name,
        currentUser.id,
      );

      const newUser = db
        .prepare(
          "SELECT id, username, email, role, display_name, is_active FROM users WHERE id = ?",
        )
        .get(result.lastInsertRowid);

      auditUtils.logAction(
        db,
        currentUser.id,
        "user_created",
        "users",
        newUser.id,
        null,
        newUser,
      );

      return { ok: true, user: newUser };
    } catch (error) {
      console.error("Create user error:", error);
      return { ok: false, error: error.message };
    }
  },

  updateUser(userId, updates) {
    try {
      if (
        !currentUser ||
        !permissionUtils.userCan(db, currentUser, "users:update")
      ) {
        return { ok: false, error: "Permission denied" };
      }

      const oldUser = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(userId);
      if (!oldUser) {
        return { ok: false, error: "User not found" };
      }

      const allowedUpdates = ["email", "display_name", "role"];
      const query = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          query.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (query.length === 0) {
        return { ok: false, error: "No valid updates provided" };
      }

      values.push(userId);
      const stmt = db.prepare(
        `UPDATE users SET ${query.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      );
      stmt.run(...values);

      const updatedUser = db
        .prepare(
          "SELECT id, username, email, role, display_name, is_active FROM users WHERE id = ?",
        )
        .get(userId);

      auditUtils.logAction(
        db,
        currentUser.id,
        "user_updated",
        "users",
        userId,
        oldUser,
        updatedUser,
      );

      return { ok: true, user: updatedUser };
    } catch (error) {
      console.error("Update user error:", error);
      return { ok: false, error: error.message };
    }
  },

  deleteUser(userId) {
    try {
      if (
        !currentUser ||
        !permissionUtils.userCan(db, currentUser, "users:delete")
      ) {
        return { ok: false, error: "Permission denied" };
      }

      if (userId === currentUser.id) {
        return { ok: false, error: "Cannot delete your own account" };
      }

      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        return { ok: false, error: "User not found" };
      }

      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
      auditUtils.logAction(
        db,
        currentUser.id,
        "user_deleted",
        "users",
        userId,
        user,
        null,
      );

      return { ok: true };
    } catch (error) {
      console.error("Delete user error:", error);
      return { ok: false, error: error.message };
    }
  },

  getUsers() {
    if (
      !currentUser ||
      !permissionUtils.userCan(db, currentUser, "users:read")
    ) {
      return [];
    }

    try {
      return db
        .prepare(
          "SELECT id, username, email, role, display_name, is_active FROM users ORDER BY id DESC",
        )
        .all();
    } catch (error) {
      console.error("Get users error:", error);
      return [];
    }
  },

  changePassword(oldPassword, newPassword) {
    try {
      if (!currentUser) {
        return { ok: false, error: "Not logged in" };
      }

      const user = db
        .prepare("SELECT password_hash FROM users WHERE id = ?")
        .get(currentUser.id);

      if (!passwordUtils.verifyPassword(oldPassword, user.password_hash)) {
        auditUtils.logAction(
          db,
          currentUser.id,
          "password_change_failed",
          "users",
          currentUser.id,
        );
        return { ok: false, error: "Old password is incorrect" };
      }

      const validation = passwordUtils.validatePasswordStrength(newPassword);
      if (!validation.isStrong) {
        return {
          ok: false,
          error: `Weak password: ${validation.errors.join(", ")}`,
        };
      }

      const newHash = passwordUtils.hashPassword(newPassword);
      db.prepare(
        "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ).run(newHash, currentUser.id);

      auditUtils.logAction(
        db,
        currentUser.id,
        "password_changed",
        "users",
        currentUser.id,
      );

      return { ok: true };
    } catch (error) {
      console.error("Change password error:", error);
      return { ok: false, error: error.message };
    }
  },

  // ===== PERMISSIONS & ROLES =====

  getPermissions(role) {
    return permissionUtils.getPermissionsForRole(db, role);
  },

  getAllRoles() {
    return permissionUtils.getAllRoles();
  },

  hasPermission(permission) {
    if (!currentUser) return false;
    return permissionUtils.userCan(db, currentUser, permission);
  },

  // ===== PRODUCTS =====

  getProducts() {
    if (
      !currentUser ||
      !permissionUtils.userCan(db, currentUser, "products:read")
    ) {
      return [];
    }

    try {
      return db
        .prepare(
          `SELECT
            p.id, p.name, p.unit, p.price, p.stock,
            (p.stock - COALESCE((
              SELECT SUM(r.quantity)
              FROM reservations r
              WHERE r.product_id = p.id AND datetime(r.expiry_date) > datetime('now')
            ), 0)) AS available_stock
          FROM products p
          ORDER BY p.id DESC`,
        )
        .all();
    } catch (error) {
      console.error("Get products error:", error);
      return [];
    }
  },

  addProduct(product) {
    try {
      if (
        !currentUser ||
        !permissionUtils.userCan(db, currentUser, "products:create")
      ) {
        throw new Error("Permission denied");
      }

      // Validation
      const nameValidation = validationUtils.isValidProductName(product.name);
      if (!nameValidation.valid) throw new Error(nameValidation.error);

      const priceValidation = validationUtils.isValidPrice(product.price);
      if (!priceValidation.valid) throw new Error(priceValidation.error);

      const stockValidation = validationUtils.isValidStock(product.stock);
      if (!stockValidation.valid) throw new Error(stockValidation.error);

      const stmt = db.prepare(
        "INSERT INTO products (name, unit, price, stock) VALUES (?, ?, ?, ?)",
      );
      const info = stmt.run(
        product.name,
        product.unit,
        product.price,
        product.stock,
      );

      const newProduct = db
        .prepare(
          "SELECT id, name, unit, price, stock FROM products WHERE id = ?",
        )
        .get(info.lastInsertRowid);

      auditUtils.logAction(
        db,
        currentUser.id,
        "product_created",
        "products",
        newProduct.id,
        null,
        newProduct,
      );

      return newProduct;
    } catch (error) {
      console.error("Add product error:", error);
      throw error;
    }
  },

  updateProduct(product) {
    try {
      if (
        !currentUser ||
        !permissionUtils.userCan(db, currentUser, "products:update")
      ) {
        throw new Error("Permission denied");
      }

      const oldProduct = db
        .prepare("SELECT * FROM products WHERE id = ?")
        .get(product.id);
      if (!oldProduct) throw new Error("Product not found");

      // Validation
      const nameValidation = validationUtils.isValidProductName(product.name);
      if (!nameValidation.valid) throw new Error(nameValidation.error);

      const priceValidation = validationUtils.isValidPrice(product.price);
      if (!priceValidation.valid) throw new Error(priceValidation.error);

      const stockValidation = validationUtils.isValidStock(product.stock);
      if (!stockValidation.valid) throw new Error(stockValidation.error);

      const stmt = db.prepare(
        "UPDATE products SET name = ?, unit = ?, price = ?, stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      );
      stmt.run(
        product.name,
        product.unit,
        product.price,
        product.stock,
        product.id,
      );

      const updatedProduct = db
        .prepare(
          `SELECT
            p.id, p.name, p.unit, p.price, p.stock,
            (p.stock - COALESCE((
              SELECT SUM(r.quantity)
              FROM reservations r
              WHERE r.product_id = p.id AND datetime(r.expiry_date) > datetime('now')
            ), 0)) AS available_stock
          FROM products p
          WHERE p.id = ?`,
        )
        .get(product.id);

      auditUtils.logAction(
        db,
        currentUser.id,
        "product_updated",
        "products",
        product.id,
        oldProduct,
        updatedProduct,
      );

      return updatedProduct;
    } catch (error) {
      console.error("Update product error:", error);
      throw error;
    }
  },

  deleteProduct(productId) {
    try {
      if (
        !currentUser ||
        !permissionUtils.userCan(db, currentUser, "products:delete")
      ) {
        throw new Error("Permission denied");
      }

      const hasInvoiceItems = db
        .prepare(
          "SELECT COUNT(*) as count FROM invoice_items WHERE product_id = ?",
        )
        .get(productId).count;
      if (hasInvoiceItems > 0) {
        throw new Error("Cannot delete product linked to invoices");
      }

      const product = db
        .prepare("SELECT * FROM products WHERE id = ?")
        .get(productId);
      db.prepare("DELETE FROM reservations WHERE product_id = ?").run(
        productId,
      );
      const result = db
        .prepare("DELETE FROM products WHERE id = ?")
        .run(productId);

      auditUtils.logAction(
        db,
        currentUser.id,
        "product_deleted",
        "products",
        productId,
        product,
        null,
      );

      return { ok: result.changes > 0 };
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    }
  },

  // ===== INVOICES =====

  createInvoice(payload) {
    try {
      if (
        !currentUser ||
        !permissionUtils.userCan(db, currentUser, "invoices:create")
      ) {
        throw new Error("Permission denied");
      }

      // Validation
      const customerValidation = validationUtils.isValidCustomerName(
        payload.customerName,
      );
      if (!customerValidation.valid) throw new Error(customerValidation.error);

      const itemsValidation = validationUtils.validateInvoiceItems(
        payload.items,
      );
      if (!itemsValidation.valid) throw new Error(itemsValidation.error);

      const taxValidation = validationUtils.isValidTaxRate(payload.taxRate);
      if (!taxValidation.valid) throw new Error(taxValidation.error);

      const now = new Date();
      const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Date.now().toString().slice(-4)}`;
      let subtotal = 0;

      for (const item of payload.items) {
        const product = db
          .prepare(
            `SELECT
              p.id, p.name, p.price, p.stock,
              (p.stock - COALESCE((
                SELECT SUM(r.quantity)
                FROM reservations r
                WHERE r.product_id = p.id AND datetime(r.expiry_date) > datetime('now')
              ), 0)) AS available_stock
            FROM products p
            WHERE p.id = ?`,
          )
          .get(item.productId);
        if (!product) continue;
        if (item.quantity > product.available_stock) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        subtotal += product.price * item.quantity;
      }

      const taxAmount = subtotal * (payload.taxRate / 100);
      const totalAmount = subtotal + taxAmount;
      const status =
        payload.paidAmount >= totalAmount
          ? "paid"
          : payload.paidAmount > 0
            ? "partial"
            : "unpaid";

      const insertInvoice = db.prepare(
        "INSERT INTO invoices (invoice_number, customer_name, subtotal, tax_rate, tax_amount, total_amount, paid_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      );
      const invoiceInfo = insertInvoice.run(
        invoiceNumber,
        payload.customerName,
        subtotal,
        payload.taxRate,
        taxAmount,
        totalAmount,
        payload.paidAmount,
        status,
      );

      const insertItem = db.prepare(
        "INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?)",
      );
      const updateStock = db.prepare(
        "UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      );

      for (const item of payload.items) {
        const product = db
          .prepare("SELECT id, name, price FROM products WHERE id = ?")
          .get(item.productId);
        if (!product) continue;
        insertItem.run(
          invoiceInfo.lastInsertRowid,
          product.id,
          product.name,
          item.quantity,
          product.price,
          product.price * item.quantity,
        );
        updateStock.run(item.quantity, product.id);
      }

      if (payload.paidAmount > 0) {
        db.prepare(
          "INSERT INTO payments (invoice_id, amount) VALUES (?, ?)",
        ).run(invoiceInfo.lastInsertRowid, payload.paidAmount);
      }

      const invoice = db
        .prepare("SELECT * FROM invoices WHERE id = ?")
        .get(invoiceInfo.lastInsertRowid);
      auditUtils.logAction(
        db,
        currentUser.id,
        "invoice_created",
        "invoices",
        invoice.id,
        null,
        invoice,
      );

      return invoice;
    } catch (error) {
      console.error("Create invoice error:", error);
      throw error;
    }
  },

  getInvoices() {
    if (
      !currentUser ||
      !permissionUtils.userCan(db, currentUser, "invoices:read")
    ) {
      return [];
    }

    try {
      return db.prepare("SELECT * FROM invoices ORDER BY id DESC").all();
    } catch (error) {
      console.error("Get invoices error:", error);
      return [];
    }
  },

  // ===== RESERVATIONS =====

  createReservation(payload) {
    try {
      if (
        !currentUser ||
        !permissionUtils.userCan(db, currentUser, "reservations:create")
      ) {
        throw new Error("Permission denied");
      }

      const expiry = db
        .prepare("SELECT datetime('now', '+48 hours') as expiry")
        .get().expiry;
      const insertReservation = db.prepare(
        "INSERT INTO reservations (product_id, quantity, customer_name, expiry_date) VALUES (?, ?, ?, ?)",
      );

      for (const item of payload.items) {
        const product = db
          .prepare(
            `SELECT
              p.id, p.name, p.stock,
              (p.stock - COALESCE((
                SELECT SUM(r.quantity)
                FROM reservations r
                WHERE r.product_id = p.id AND datetime(r.expiry_date) > datetime('now')
              ), 0)) AS available_stock
            FROM products p
            WHERE p.id = ?`,
          )
          .get(item.productId);
        if (!product) continue;
        if (item.quantity > product.available_stock) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        insertReservation.run(
          item.productId,
          item.quantity,
          payload.customerName || "Walk-in",
          expiry,
        );
      }

      auditUtils.logAction(
        db,
        currentUser.id,
        "reservation_created",
        "reservations",
        null,
        null,
        payload,
      );

      return { ok: true, reservationCount: payload.items.length };
    } catch (error) {
      console.error("Create reservation error:", error);
      throw error;
    }
  },

  // ===== DASHBOARD =====

  getDashboard() {
    if (!currentUser) {
      return {
        totalSales: 0,
        unpaidBalance: 0,
        invoiceCount: 0,
        topProducts: [],
      };
    }

    try {
      const totalSales = db
        .prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices")
        .get().total;
      const unpaidBalance = db
        .prepare(
          "SELECT COALESCE(SUM(total_amount - paid_amount), 0) as total FROM invoices",
        )
        .get().total;
      const invoiceCount = db
        .prepare("SELECT COUNT(*) as count FROM invoices")
        .get().count;
      const topProducts = db
        .prepare(
          "SELECT product_name as name, COALESCE(SUM(quantity), 0) as qty FROM invoice_items GROUP BY product_name ORDER BY qty DESC LIMIT 5",
        )
        .all();
      return { totalSales, unpaidBalance, invoiceCount, topProducts };
    } catch (error) {
      console.error("Get dashboard error:", error);
      return {
        totalSales: 0,
        unpaidBalance: 0,
        invoiceCount: 0,
        topProducts: [],
      };
    }
  },

  // ===== AUDIT LOGS =====

  getAuditLogs(filters = {}) {
    if (
      !currentUser ||
      !permissionUtils.userCan(db, currentUser, "audit:read")
    ) {
      return [];
    }

    try {
      return auditUtils.getAuditLogs(db, filters);
    } catch (error) {
      console.error("Get audit logs error:", error);
      return [];
    }
  },

  // ===== BACKUP & RESTORE =====

  createBackup(description = "") {
    try {
      if (
        !currentUser ||
        !permissionUtils.userCan(db, currentUser, "backup:create")
      ) {
        return { ok: false, error: "Permission denied" };
      }

      const result = backupUtils.createBackup(
        dbPath,
        backupDir,
        db,
        currentUser.id,
      );
      if (result.ok) {
        auditUtils.logAction(
          db,
          currentUser.id,
          "backup_created",
          "backups",
          null,
          null,
          { path: result.backup_path },
        );
      }
      return result;
    } catch (error) {
      console.error("Create backup error:", error);
      return { ok: false, error: error.message };
    }
  },

  listBackups() {
    if (
      !currentUser ||
      !permissionUtils.userCan(db, currentUser, "backup:create")
    ) {
      return [];
    }

    try {
      return backupUtils.listBackups(backupDir);
    } catch (error) {
      console.error("List backups error:", error);
      return [];
    }
  },

  restoreBackup(backupPath) {
    try {
      if (
        !currentUser ||
        !permissionUtils.userCan(db, currentUser, "backup:create")
      ) {
        return { ok: false, error: "Permission denied" };
      }

      const result = backupUtils.restoreBackup(
        backupPath,
        dbPath,
        db,
        currentUser.id,
      );
      if (result.ok) {
        auditUtils.logAction(
          db,
          currentUser.id,
          "backup_restored",
          "backups",
          null,
          null,
          { path: backupPath },
        );
      }
      return result;
    } catch (error) {
      console.error("Restore backup error:", error);
      return { ok: false, error: error.message };
    }
  },

  // ===== DATA EXPORT =====

  exportData() {
    try {
      if (!currentUser) {
        return { ok: false, error: "Not authenticated" };
      }

      const result = backupUtils.exportData(db, "json");
      if (result.ok) {
        auditUtils.logAction(
          db,
          currentUser.id,
          "data_exported",
          "system",
          null,
          null,
          { format: "json" },
        );
      }
      return result;
    } catch (error) {
      console.error("Export data error:", error);
      return { ok: false, error: error.message };
    }
  },

  // ===== MAINTENANCE =====

  cleanup() {
    try {
      auditUtils.clearOldLogs(db, 90);
      backupUtils.cleanupOldBackups(backupDir, 10);
      return { ok: true };
    } catch (error) {
      console.error("Cleanup error:", error);
      return { ok: false, error: error.message };
    }
  },

  // ========== PHASE 2: PURCHASES MODULE HANDLERS ==========

  // ===== SUPPLIERS =====
  suppliers_list() {
    try {
      const suppliers = db
        .prepare(
          `
        SELECT * FROM suppliers 
        WHERE is_active = 1 
        ORDER BY name
      `,
        )
        .all();
      return suppliers;
    } catch (error) {
      console.error("Error getting suppliers:", error);
      throw error;
    }
  },

  suppliers_create(data) {
    try {
      if (!currentUser) throw new Error("Not authenticated");
      const result = db
        .prepare(
          `
        INSERT INTO suppliers (name, contact_person, email, phone, address, city, payment_terms, tax_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          data.name,
          data.contact_person,
          data.email,
          data.phone,
          data.address,
          data.city,
          data.payment_terms,
          data.tax_id,
          data.notes,
        );

      const supplier = db
        .prepare("SELECT * FROM suppliers WHERE id = ?")
        .get(result.lastInsertRowid);
      auditUtils.logAction(
        db,
        currentUser.id,
        "CREATE",
        "suppliers",
        result.lastInsertRowid,
        null,
        JSON.stringify(supplier),
      );

      return { ok: true, supplier };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },

  suppliers_update(data) {
    try {
      if (!currentUser) throw new Error("Not authenticated");
      const old = db
        .prepare("SELECT * FROM suppliers WHERE id = ?")
        .get(data.id);

      db.prepare(
        `
        UPDATE suppliers 
        SET name = ?, contact_person = ?, email = ?, phone = ?, 
            address = ?, city = ?, payment_terms = ?, tax_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(
        data.name,
        data.contact_person,
        data.email,
        data.phone,
        data.address,
        data.city,
        data.payment_terms,
        data.tax_id,
        data.notes,
        data.id,
      );

      const updated = db
        .prepare("SELECT * FROM suppliers WHERE id = ?")
        .get(data.id);
      auditUtils.logAction(
        db,
        currentUser.id,
        "UPDATE",
        "suppliers",
        data.id,
        JSON.stringify(old),
        JSON.stringify(updated),
      );

      return { ok: true, supplier: updated };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },

  suppliers_delete(data) {
    try {
      if (!currentUser) throw new Error("Not authenticated");
      const supplier = db
        .prepare("SELECT * FROM suppliers WHERE id = ?")
        .get(data.id);

      db.prepare("UPDATE suppliers SET is_active = 0 WHERE id = ?").run(
        data.id,
      );
      auditUtils.logAction(
        db,
        currentUser.id,
        "DELETE",
        "suppliers",
        data.id,
        JSON.stringify(supplier),
        null,
      );

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },

  // ===== PURCHASE ORDERS =====
  purchase_orders_list() {
    try {
      const orders = db
        .prepare(
          `
        SELECT 
          po.*,
          s.name as supplier_name,
          u.display_name as created_by_name
        FROM purchase_orders po
        LEFT JOIN suppliers s ON po.supplier_id = s.id
        LEFT JOIN users u ON po.created_by = u.id
        ORDER BY po.order_date DESC
      `,
        )
        .all();
      return orders;
    } catch (error) {
      console.error("Error getting purchase orders:", error);
      throw error;
    }
  },

  purchase_orders_create(data) {
    try {
      if (!currentUser) throw new Error("Not authenticated");

      const poNumber = `PO-${Date.now()}`;

      const result = db
        .prepare(
          `
        INSERT INTO purchase_orders (po_number, supplier_id, expected_delivery, notes, created_by)
        VALUES (?, ?, ?, ?, ?)
      `,
        )
        .run(
          poNumber,
          data.supplier_id,
          data.expected_delivery,
          data.notes,
          currentUser.id,
        );

      const po = db
        .prepare("SELECT * FROM purchase_orders WHERE id = ?")
        .get(result.lastInsertRowid);
      auditUtils.logAction(
        db,
        currentUser.id,
        "CREATE",
        "purchase_orders",
        result.lastInsertRowid,
        null,
        JSON.stringify(po),
      );

      return { ok: true, po };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },

  purchase_orders_update(data) {
    try {
      if (!currentUser) throw new Error("Not authenticated");
      const old = db
        .prepare("SELECT * FROM purchase_orders WHERE id = ?")
        .get(data.id);

      db.prepare(
        `
        UPDATE purchase_orders 
        SET status = ?, notes = ?, expected_delivery = ?
        WHERE id = ?
      `,
      ).run(data.status, data.notes, data.expected_delivery, data.id);

      const updated = db
        .prepare("SELECT * FROM purchase_orders WHERE id = ?")
        .get(data.id);
      auditUtils.logAction(
        db,
        currentUser.id,
        "UPDATE",
        "purchase_orders",
        data.id,
        JSON.stringify(old),
        JSON.stringify(updated),
      );

      return { ok: true, po: updated };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },

  purchase_orders_get(poId) {
    try {
      const po = db
        .prepare(
          `
        SELECT 
          po.*,
          s.name as supplier_name,
          u.display_name as created_by_name
        FROM purchase_orders po
        LEFT JOIN suppliers s ON po.supplier_id = s.id
        LEFT JOIN users u ON po.created_by = u.id
        WHERE po.id = ?
      `,
        )
        .get(poId);
      return po;
    } catch (error) {
      console.error("Error getting PO:", error);
      throw error;
    }
  },

  // ===== PURCHASE ITEMS =====
  purchase_items_add(data) {
    try {
      if (!currentUser) throw new Error("Not authenticated");

      const result = db
        .prepare(
          `
        INSERT INTO purchase_items 
        (purchase_order_id, product_id, quantity_ordered, unit_price, line_total, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          data.purchase_order_id,
          data.product_id,
          data.quantity_ordered,
          data.unit_price,
          data.line_total,
          data.notes,
        );

      const items = db
        .prepare(
          `
        SELECT SUM(line_total) as subtotal FROM purchase_items WHERE purchase_order_id = ?
      `,
        )
        .get(data.purchase_order_id);

      const tax_amount = ((items.subtotal || 0) * (data.tax_rate || 0)) / 100;
      const total = (items.subtotal || 0) + tax_amount;

      db.prepare(
        `
        UPDATE purchase_orders 
        SET subtotal = ?, tax_amount = ?, total_amount = ?
        WHERE id = ?
      `,
      ).run(items.subtotal, tax_amount, total, data.purchase_order_id);

      const item = db
        .prepare("SELECT * FROM purchase_items WHERE id = ?")
        .get(result.lastInsertRowid);
      auditUtils.logAction(
        db,
        currentUser.id,
        "CREATE",
        "purchase_items",
        result.lastInsertRowid,
        null,
        JSON.stringify(item),
      );

      return { ok: true, item };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },

  purchase_items_list(poId) {
    try {
      const items = db
        .prepare(
          `
        SELECT 
          pi.*,
          p.name as product_name
        FROM purchase_items pi
        LEFT JOIN products p ON pi.product_id = p.id
        WHERE pi.purchase_order_id = ?
      `,
        )
        .all(poId);
      return items;
    } catch (error) {
      console.error("Error getting purchase items:", error);
      throw error;
    }
  },

  purchase_items_remove(itemId) {
    try {
      if (!currentUser) throw new Error("Not authenticated");
      const item = db
        .prepare("SELECT * FROM purchase_items WHERE id = ?")
        .get(itemId);

      db.prepare("DELETE FROM purchase_items WHERE id = ?").run(itemId);
      auditUtils.logAction(
        db,
        currentUser.id,
        "DELETE",
        "purchase_items",
        itemId,
        JSON.stringify(item),
        null,
      );

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },

  // ===== GOODS RECEIVED =====
  goods_received_create(data) {
    try {
      if (!currentUser) throw new Error("Not authenticated");

      db.prepare("BEGIN TRANSACTION");

      const result = db
        .prepare(
          `
        INSERT INTO goods_received (purchase_order_id, received_by, total_items, damaged_items, notes)
        VALUES (?, ?, ?, ?, ?)
      `,
        )
        .run(
          data.purchase_order_id,
          currentUser.id,
          data.total_items,
          data.damaged_items,
          data.notes,
        );

      db.prepare(
        `
        UPDATE purchase_orders SET status = 'received', actual_delivery = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(data.purchase_order_id);

      // Update product stock
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          db.prepare(
            `
            UPDATE products SET stock = stock + ? WHERE id = ?
          `,
          ).run(item.quantity_received, item.product_id);
        }
      }

      db.prepare("COMMIT");

      const received = db
        .prepare("SELECT * FROM goods_received WHERE id = ?")
        .get(result.lastInsertRowid);
      auditUtils.logAction(
        db,
        currentUser.id,
        "CREATE",
        "goods_received",
        result.lastInsertRowid,
        null,
        JSON.stringify(received),
      );

      return { ok: true, received };
    } catch (error) {
      db.prepare("ROLLBACK");
      return { ok: false, error: error.message };
    }
  },

  goods_received_list(poId) {
    try {
      const received = db
        .prepare(
          `
        SELECT 
          gr.*,
          u.display_name as received_by_name
        FROM goods_received gr
        LEFT JOIN users u ON gr.received_by = u.id
        WHERE gr.purchase_order_id = ?
        ORDER BY gr.received_date DESC
      `,
        )
        .all(poId);
      return received;
    } catch (error) {
      console.error("Error getting goods received:", error);
      throw error;
    }
  },

  // ===== SUPPLIER PAYMENTS =====
  supplier_payments_create(data) {
    try {
      if (!currentUser) throw new Error("Not authenticated");

      const result = db
        .prepare(
          `
        INSERT INTO supplier_payments 
        (purchase_order_id, supplier_id, amount_paid, payment_method, reference_number, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          data.purchase_order_id,
          data.supplier_id,
          data.amount_paid,
          data.payment_method,
          data.reference_number,
          data.notes,
          currentUser.id,
        );

      auditUtils.logAction(
        db,
        currentUser.id,
        "CREATE",
        "supplier_payments",
        result.lastInsertRowid,
        null,
        JSON.stringify(data),
      );

      return { ok: true, id: result.lastInsertRowid };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  },

  supplier_payments_list(poId) {
    try {
      const payments = db
        .prepare(
          `
        SELECT 
          sp.*,
          s.name as supplier_name
        FROM supplier_payments sp
        LEFT JOIN suppliers s ON sp.supplier_id = s.id
        WHERE sp.purchase_order_id = ?
        ORDER BY sp.payment_date DESC
      `,
        )
        .all(poId);
      return payments;
    } catch (error) {
      console.error("Error getting supplier payments:", error);
      throw error;
    }
  },

  supplier_payments_by_supplier(supplierId) {
    try {
      const payments = db
        .prepare(
          `
        SELECT 
          sp.*,
          po.po_number,
          s.name as supplier_name
        FROM supplier_payments sp
        LEFT JOIN purchase_orders po ON sp.purchase_order_id = po.id
        LEFT JOIN suppliers s ON sp.supplier_id = s.id
        WHERE sp.supplier_id = ?
        ORDER BY sp.payment_date DESC
      `,
        )
        .all(supplierId);
      return payments;
    } catch (error) {
      console.error("Error getting supplier payments:", error);
      throw error;
    }
  },

  // ===== END PHASE 2: PURCHASES MODULE HANDLERS =====
};

module.exports = { dbApi };

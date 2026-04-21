# 🔧 PHASE 2 IMPLEMENTATION GUIDE

## Feature 1: PURCHASES MODULE (Week 1-2)

### Overview
The Purchases Module allows you to manage supplier relationships, create purchase orders, receive goods, and track supplier payments.

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Step 1: Add database tables to schema.sql
- [ ] Step 2: Create API methods in sqlite.cjs
- [ ] Step 3: Add API signatures to api.ts
- [ ] Step 4: Create React pages
- [ ] Step 5: Update Layout.tsx navigation
- [ ] Step 6: Update App.tsx routing
- [ ] Step 7: Add permissions
- [ ] Step 8: Test complete workflow
- [ ] Step 9: Update documentation

---

## 🗄️ STEP 1: ADD DATABASE TABLES

### Location: `src/db/schema.sql`

**Action**: Add these 5 table definitions to the end of schema.sql (before sample data):

```sql
-- PHASE 2: PURCHASES MODULE TABLES
-- Add after the Phase 1 tables and before INSERT statements

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

-- Sample suppliers
INSERT OR IGNORE INTO suppliers (id, name, contact_person, email, phone, city) VALUES
  (1, 'Supplier A', 'Ahmed', 'ahmed@supplier.com', '01234567890', 'Cairo'),
  (2, 'Supplier B', 'Ali', 'ali@supplier.com', '01234567891', 'Giza');
```

**File to modify**: `src/db/schema.sql`

---

## 📡 STEP 2: CREATE API METHODS

### Location: `electron/sqlite.cjs`

**Action**: Add these methods to handle purchases:

```javascript
// ========== PURCHASES MODULE HANDLERS ==========

// SUPPLIERS
ipcMain.handle('suppliers:list', async () => {
  try {
    const db = getDatabase();
    const suppliers = db.prepare(`
      SELECT * FROM suppliers 
      WHERE is_active = 1 
      ORDER BY name
    `).all();
    return suppliers;
  } catch (error) {
    console.error('Error getting suppliers:', error);
    throw error;
  }
});

ipcMain.handle('suppliers:create', async (event, data) => {
  try {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO suppliers (name, contact_person, email, phone, address, city, payment_terms, tax_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.name, data.contact_person, data.email, data.phone, 
      data.address, data.city, data.payment_terms, data.tax_id, data.notes
    );
    
    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid);
    logAudit(db, data.userId, 'CREATE', 'suppliers', result.lastInsertRowid, null, JSON.stringify(supplier));
    
    return { ok: true, supplier };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('suppliers:update', async (event, data) => {
  try {
    const db = getDatabase();
    const old = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(data.id);
    
    db.prepare(`
      UPDATE suppliers 
      SET name = ?, contact_person = ?, email = ?, phone = ?, 
          address = ?, city = ?, payment_terms = ?, tax_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.name, data.contact_person, data.email, data.phone,
      data.address, data.city, data.payment_terms, data.tax_id, data.notes, data.id
    );
    
    const updated = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(data.id);
    logAudit(db, data.userId, 'UPDATE', 'suppliers', data.id, JSON.stringify(old), JSON.stringify(updated));
    
    return { ok: true, supplier: updated };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('suppliers:delete', async (event, data) => {
  try {
    const db = getDatabase();
    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(data.id);
    
    db.prepare('UPDATE suppliers SET is_active = 0 WHERE id = ?').run(data.id);
    logAudit(db, data.userId, 'DELETE', 'suppliers', data.id, JSON.stringify(supplier), null);
    
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

// PURCHASE ORDERS
ipcMain.handle('purchase-orders:list', async () => {
  try {
    const db = getDatabase();
    const orders = db.prepare(`
      SELECT 
        po.*,
        s.name as supplier_name,
        u.display_name as created_by_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.created_by = u.id
      ORDER BY po.order_date DESC
    `).all();
    return orders;
  } catch (error) {
    console.error('Error getting purchase orders:', error);
    throw error;
  }
});

ipcMain.handle('purchase-orders:create', async (event, data) => {
  try {
    const db = getDatabase();
    
    // Generate PO number
    const poNumber = `PO-${Date.now()}`;
    
    const result = db.prepare(`
      INSERT INTO purchase_orders (po_number, supplier_id, expected_delivery, notes, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(poNumber, data.supplier_id, data.expected_delivery, data.notes, data.userId);
    
    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(result.lastInsertRowid);
    logAudit(db, data.userId, 'CREATE', 'purchase_orders', result.lastInsertRowid, null, JSON.stringify(po));
    
    return { ok: true, po };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

// PURCHASE ITEMS
ipcMain.handle('purchase-items:add', async (event, data) => {
  try {
    const db = getDatabase();
    
    const result = db.prepare(`
      INSERT INTO purchase_items 
      (purchase_order_id, product_id, quantity_ordered, unit_price, line_total, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      data.purchase_order_id, data.product_id, data.quantity_ordered,
      data.unit_price, data.line_total, data.notes
    );
    
    // Update PO totals
    const items = db.prepare(`
      SELECT SUM(line_total) as subtotal FROM purchase_items WHERE purchase_order_id = ?
    `).get(data.purchase_order_id);
    
    const tax_amount = items.subtotal * (data.tax_rate || 0) / 100;
    const total = items.subtotal + tax_amount;
    
    db.prepare(`
      UPDATE purchase_orders 
      SET subtotal = ?, tax_amount = ?, total_amount = ?
      WHERE id = ?
    `).run(items.subtotal, tax_amount, total, data.purchase_order_id);
    
    const item = db.prepare('SELECT * FROM purchase_items WHERE id = ?').get(result.lastInsertRowid);
    logAudit(db, data.userId, 'CREATE', 'purchase_items', result.lastInsertRowid, null, JSON.stringify(item));
    
    return { ok: true, item };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('purchase-items:list', async (event, poId) => {
  try {
    const db = getDatabase();
    const items = db.prepare(`
      SELECT 
        pi.*,
        p.name as product_name
      FROM purchase_items pi
      LEFT JOIN products p ON pi.product_id = p.id
      WHERE pi.purchase_order_id = ?
    `).all(poId);
    return items;
  } catch (error) {
    console.error('Error getting purchase items:', error);
    throw error;
  }
});

// GOODS RECEIVED
ipcMain.handle('goods-received:create', async (event, data) => {
  try {
    const db = getDatabase();
    
    db.prepare('BEGIN TRANSACTION');
    
    const result = db.prepare(`
      INSERT INTO goods_received (purchase_order_id, received_by, total_items, damaged_items, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.purchase_order_id, data.userId, data.total_items, data.damaged_items, data.notes);
    
    // Update PO status
    db.prepare(`
      UPDATE purchase_orders SET status = 'received', actual_delivery = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(data.purchase_order_id);
    
    // Update product stock
    for (const item of data.items) {
      db.prepare(`
        UPDATE products SET stock = stock + ? WHERE id = ?
      `).run(item.quantity_received, item.product_id);
    }
    
    db.prepare('COMMIT');
    
    const received = db.prepare('SELECT * FROM goods_received WHERE id = ?').get(result.lastInsertRowid);
    logAudit(db, data.userId, 'CREATE', 'goods_received', result.lastInsertRowid, null, JSON.stringify(received));
    
    return { ok: true, received };
  } catch (error) {
    db.prepare('ROLLBACK');
    return { ok: false, error: error.message };
  }
});

// SUPPLIER PAYMENTS
ipcMain.handle('supplier-payments:create', async (event, data) => {
  try {
    const db = getDatabase();
    
    const result = db.prepare(`
      INSERT INTO supplier_payments 
      (purchase_order_id, supplier_id, amount_paid, payment_method, reference_number, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.purchase_order_id, data.supplier_id, data.amount_paid, 
      data.payment_method, data.reference_number, data.notes, data.userId
    );
    
    logAudit(db, data.userId, 'CREATE', 'supplier_payments', result.lastInsertRowid, null, null);
    
    return { ok: true, id: result.lastInsertRowid };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('supplier-payments:list', async (event, poId) => {
  try {
    const db = getDatabase();
    const payments = db.prepare(`
      SELECT 
        sp.*,
        s.name as supplier_name
      FROM supplier_payments sp
      LEFT JOIN suppliers s ON sp.supplier_id = s.id
      WHERE sp.purchase_order_id = ?
      ORDER BY sp.payment_date DESC
    `).all(poId);
    return payments;
  } catch (error) {
    console.error('Error getting supplier payments:', error);
    throw error;
  }
});
```

**File to modify**: `electron/sqlite.cjs`  
**Location**: Add after existing handlers (around line 1200+)

---

## 📝 STEP 3: ADD API SIGNATURES

### Location: `src/api.ts`

**Action**: Add these type definitions:

```typescript
// Purchases Module API signatures

// Suppliers
export async function getSuppilers(): Promise<Supplier[]> {
  return window.electronAPI?.invoke('suppliers:list') ?? [];
}

export async function createSupplier(supplier: {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  payment_terms?: string;
  tax_id?: string;
  notes?: string;
}): Promise<{ ok: boolean; supplier?: Supplier; error?: string }> {
  return window.electronAPI?.invoke('suppliers:create', { ...supplier, userId: getCurrentUser()?.id });
}

export async function updateSupplier(id: number, supplier: Partial<Supplier>): Promise<{ ok: boolean; supplier?: Supplier; error?: string }> {
  return window.electronAPI?.invoke('suppliers:update', { ...supplier, id, userId: getCurrentUser()?.id });
}

export async function deleteSupplier(id: number): Promise<{ ok: boolean; error?: string }> {
  return window.electronAPI?.invoke('suppliers:delete', { id, userId: getCurrentUser()?.id });
}

// Purchase Orders
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  return window.electronAPI?.invoke('purchase-orders:list') ?? [];
}

export async function createPurchaseOrder(po: {
  supplier_id: number;
  expected_delivery?: string;
  notes?: string;
}): Promise<{ ok: boolean; po?: PurchaseOrder; error?: string }> {
  return window.electronAPI?.invoke('purchase-orders:create', { ...po, userId: getCurrentUser()?.id });
}

// Purchase Items
export async function addPurchaseItem(item: {
  purchase_order_id: number;
  product_id: number;
  quantity_ordered: number;
  unit_price: number;
  line_total: number;
  tax_rate?: number;
  notes?: string;
}): Promise<{ ok: boolean; item?: PurchaseItem; error?: string }> {
  return window.electronAPI?.invoke('purchase-items:add', { ...item, userId: getCurrentUser()?.id });
}

export async function getPurchaseItems(poId: number): Promise<PurchaseItem[]> {
  return window.electronAPI?.invoke('purchase-items:list', poId) ?? [];
}

// Goods Received
export async function createGoodsReceived(data: {
  purchase_order_id: number;
  total_items: number;
  damaged_items?: number;
  items: Array<{ product_id: number; quantity_received: number }>;
  notes?: string;
}): Promise<{ ok: boolean; received?: GoodsReceived; error?: string }> {
  return window.electronAPI?.invoke('goods-received:create', { ...data, userId: getCurrentUser()?.id });
}

// Supplier Payments
export async function createSupplierPayment(payment: {
  purchase_order_id: number;
  supplier_id: number;
  amount_paid: number;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}): Promise<{ ok: boolean; id?: number; error?: string }> {
  return window.electronAPI?.invoke('supplier-payments:create', { ...payment, userId: getCurrentUser()?.id });
}

export async function getSupplierPayments(poId: number): Promise<SupplierPayment[]> {
  return window.electronAPI?.invoke('supplier-payments:list', poId) ?? [];
}
```

**File to modify**: `src/api.ts`

---

## ⚛️ STEP 4: CREATE REACT PAGES

### 4a. Create `src/pages/SuppliersPage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { getSuppilers, createSupplier, updateSupplier, deleteSupplier } from '../api';

interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  city?: string;
  is_active: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await getSuppilers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await updateSupplier(formData.id, formData);
      } else {
        await createSupplier(formData);
      }
      setFormData({});
      setShowForm(false);
      loadSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteSupplier(id);
        loadSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <button
          onClick={() => { setShowForm(!showForm); setFormData({}); }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancel' : 'New Supplier'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded mb-6 border">
          <input
            type="text"
            placeholder="Supplier Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            placeholder="Contact Person"
            value={formData.contact_person || ''}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white p-4 rounded border shadow">
            <h3 className="font-bold text-lg">{supplier.name}</h3>
            <p className="text-gray-600">{supplier.contact_person} | {supplier.email}</p>
            <p className="text-gray-500">{supplier.phone} | {supplier.city}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => { setFormData(supplier); setShowForm(true); }}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(supplier.id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Create**: `src/pages/SuppliersPage.tsx`

### 4b. Create `src/pages/PurchaseOrdersPage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { getPurchaseOrders, getSuppilers, createPurchaseOrder } from '../api';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, suppliersData] = await Promise.all([
        getPurchaseOrders(),
        getSuppilers()
      ]);
      setOrders(ordersData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          New Purchase Order
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded mb-6 border">
          <select className="w-full p-2 border rounded mb-2">
            <option>Select Supplier</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button className="bg-green-500 text-white px-4 py-2 rounded">Create PO</button>
        </div>
      )}

      <div className="grid gap-4">
        {orders.map((order: any) => (
          <div key={order.id} className="bg-white p-4 rounded border shadow">
            <h3 className="font-bold">{order.po_number}</h3>
            <p>{order.supplier_name}</p>
            <p className="text-green-600">${order.total_amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Create**: `src/pages/PurchaseOrdersPage.tsx`

---

## 🔗 STEP 5: UPDATE NAVIGATION

### Location: `src/components/Layout.tsx`

Add these menu items in the sidebar:

```typescript
{/* Purchases Module - Add after Products menu */}
<div className="ml-4 space-y-2">
  <Link to="/suppliers" className="text-blue-600 hover:underline">📦 Suppliers</Link>
  <Link to="/purchase-orders" className="text-blue-600 hover:underline">📋 Purchase Orders</Link>
  <Link to="/goods-receiving" className="text-blue-600 hover:underline">📥 Receive Goods</Link>
</div>
```

---

## 🔀 STEP 6: UPDATE ROUTING

### Location: `src/App.tsx`

Add these routes:

```typescript
import SuppliersPage from './pages/SuppliersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import GoodsReceivingPage from './pages/GoodsReceivingPage';

// In your Router/Routes:
<Route path="/suppliers" element={<SuppliersPage />} />
<Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
<Route path="/goods-receiving" element={<GoodsReceivingPage />} />
```

---

## 🔐 STEP 7: ADD PERMISSIONS

### Location: `src/db/schema.sql`

Add these permission inserts:

```sql
-- Purchases Module Permissions
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
  ('manager', 'payments:record', 1),
  
  ('warehouse', 'purchases:read', 1),
  ('warehouse', 'goods:receive', 1);
```

---

## ✅ STEP 8: TEST COMPLETE WORKFLOW

Test these scenarios:
1. ✅ Create a new supplier
2. ✅ Create a purchase order
3. ✅ Add items to PO
4. ✅ Receive goods (updates stock)
5. ✅ Record supplier payment
6. ✅ Check audit logs

---

## 📚 STEP 9: UPDATE DOCUMENTATION

1. Update `ARCHITECTURE_DIAGRAMS.md` - Add new diagram for Purchases flow
2. Update `PROJECT_ANALYSIS.md` - Document new tables & APIs
3. Update `DEBUG_GUIDE.md` - Add troubleshooting for purchases

---

## 🚀 IMPLEMENTATION TIME ESTIMATE

- Database Tables: 1-2 hours
- API Methods: 2-3 hours
- React Pages (3 pages): 3-4 hours
- Integration & Testing: 2-3 hours
- Documentation: 1-2 hours

**Total**: 7-10 days for Purchases Module

---

## 📝 COMMON ISSUES & SOLUTIONS

| Issue | Solution |
|-------|----------|
| Foreign key error | Ensure supplier_id exists in suppliers table |
| Stock not updating | Check goods_received logic updates products.stock |
| Audit not logging | Verify logAudit function exists & is called |
| API methods not found | Ensure handlers are in sqlite.cjs before app loads |
| Routes not working | Check App.tsx has route definitions |

---

**Next Steps**:
1. Update schema.sql with new tables
2. Restart app (database recreates)
3. Start adding API methods
4. Create React pages
5. Test each step

Ready to start? Let's go! 🚀


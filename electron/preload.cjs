const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // System
  isReady: () => ipcRenderer.sendSync("system:isReady"),
  getCurrentUser: () => ipcRenderer.sendSync("user:getCurrent"),

  // Authentication & User Management
  login: (username, password) => ipcRenderer.sendSync("auth:login:sync", { username, password }),
  logout: () => ipcRenderer.sendSync("auth:logout:sync"),
  createUser: (payload) => ipcRenderer.sendSync("users:create:sync", payload),
  updateUser: (userId, updates) => ipcRenderer.sendSync("users:update:sync", { userId, updates }),
  deleteUser: (userId) => ipcRenderer.sendSync("users:delete:sync", userId),
  getUsers: () => ipcRenderer.sendSync("users:get:sync"),
  changePassword: (oldPassword, newPassword) => ipcRenderer.sendSync("auth:changePassword:sync", { oldPassword, newPassword }),

  // Permissions & Roles
  getPermissions: (role) => ipcRenderer.sendSync("permissions:get:sync", role),
  getAllRoles: () => ipcRenderer.sendSync("roles:getAll:sync"),
  hasPermission: (permission) => ipcRenderer.sendSync("permissions:check:sync", permission),

  // Products
  getProducts: () => ipcRenderer.sendSync("products:get:sync"),
  addProduct: (payload) => ipcRenderer.sendSync("products:add:sync", payload),
  updateProduct: (payload) => ipcRenderer.sendSync("products:update:sync", payload),
  deleteProduct: (productId) => ipcRenderer.sendSync("products:delete:sync", productId),

  // Invoices
  createInvoice: (payload) => ipcRenderer.sendSync("invoices:create:sync", payload),
  getInvoices: () => ipcRenderer.sendSync("invoices:get:sync"),

  // Reservations
  createReservation: (payload) => ipcRenderer.sendSync("reservations:create:sync", payload),

  // Dashboard
  getDashboard: () => ipcRenderer.sendSync("dashboard:get:sync"),

  // Audit Logs
  getAuditLogs: (filters) => ipcRenderer.sendSync("audit:getLogs:sync", filters),

  // Backup & Restore
  createBackup: (description) => ipcRenderer.sendSync("backup:create:sync", description),
  listBackups: () => ipcRenderer.sendSync("backup:list:sync"),
  restoreBackup: (backupPath) => ipcRenderer.sendSync("backup:restore:sync", backupPath),

  // Data Export
  exportData: () => ipcRenderer.sendSync("data:export:sync"),

  // ========== PHASE 2: PURCHASES MODULE ==========

  // Suppliers
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  suppliers_list: () => ipcRenderer.sendSync("suppliers:list:sync"),
  suppliers_create: (data) => ipcRenderer.sendSync("suppliers:create:sync", data),
  suppliers_update: (data) => ipcRenderer.sendSync("suppliers:update:sync", data),
  suppliers_delete: (data) => ipcRenderer.sendSync("suppliers:delete:sync", data),

  // Purchase Orders
  purchase_orders_list: () => ipcRenderer.sendSync("purchase-orders:list:sync"),
  purchase_orders_create: (data) => ipcRenderer.sendSync("purchase-orders:create:sync", data),
  purchase_orders_update: (data) => ipcRenderer.sendSync("purchase-orders:update:sync", data),
  purchase_orders_get: (poId) => ipcRenderer.sendSync("purchase-orders:get:sync", poId),

  // Purchase Items
  purchase_items_add: (data) => ipcRenderer.sendSync("purchase-items:add:sync", data),
  purchase_items_list: (poId) => ipcRenderer.sendSync("purchase-items:list:sync", poId),
  purchase_items_remove: (itemId) => ipcRenderer.sendSync("purchase-items:remove:sync", itemId),

  // Goods Received
  goods_received_create: (data) => ipcRenderer.sendSync("goods-received:create:sync", data),
  goods_received_list: (poId) => ipcRenderer.sendSync("goods-received:list:sync", poId),

  // Supplier Payments
  supplier_payments_create: (data) => ipcRenderer.sendSync("supplier-payments:create:sync", data),
  supplier_payments_list: (poId) => ipcRenderer.sendSync("supplier-payments:list:sync", poId),
  supplier_payments_by_supplier: (supplierId) => ipcRenderer.sendSync("supplier-payments:by-supplier:sync", supplierId),
});

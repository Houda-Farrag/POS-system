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
});

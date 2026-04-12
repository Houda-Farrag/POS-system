const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { dbApi } = require("./sqlite.cjs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === "development" && process.env.ELECTRON_START_URL) {
    win.loadURL(process.env.ELECTRON_START_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  dbApi.init();
  createWindow();
  
  // Cleanup old data periodically
  setInterval(() => {
    dbApi.cleanup();
  }, 24 * 60 * 60 * 1000); // Daily
});

// ===== SYSTEM =====
ipcMain.on("system:isReady", (event) => {
  event.returnValue = true;
});

ipcMain.on("user:getCurrent", (event) => {
  event.returnValue = dbApi.getCurrentUser();
});

// ===== AUTHENTICATION & USER MANAGEMENT =====
ipcMain.on("auth:login:sync", (event, payload) => {
  event.returnValue = dbApi.login(payload.username, payload.password);
});

ipcMain.on("auth:logout:sync", (event) => {
  dbApi.logout();
  event.returnValue = { ok: true };
});

ipcMain.on("users:create:sync", (event, payload) => {
  event.returnValue = dbApi.createUser(payload);
});

ipcMain.on("users:update:sync", (event, payload) => {
  event.returnValue = dbApi.updateUser(payload.userId, payload.updates);
});

ipcMain.on("users:delete:sync", (event, userId) => {
  event.returnValue = dbApi.deleteUser(userId);
});

ipcMain.on("users:get:sync", (event) => {
  event.returnValue = dbApi.getUsers();
});

ipcMain.on("auth:changePassword:sync", (event, payload) => {
  event.returnValue = dbApi.changePassword(payload.oldPassword, payload.newPassword);
});

// ===== PERMISSIONS & ROLES =====
ipcMain.on("permissions:get:sync", (event, role) => {
  event.returnValue = dbApi.getPermissions(role);
});

ipcMain.on("roles:getAll:sync", (event) => {
  event.returnValue = dbApi.getAllRoles();
});

ipcMain.on("permissions:check:sync", (event, permission) => {
  event.returnValue = dbApi.hasPermission(permission);
});

// ===== PRODUCTS =====
ipcMain.on("products:get:sync", (event) => {
  event.returnValue = dbApi.getProducts();
});

ipcMain.on("products:add:sync", (event, payload) => {
  try {
    event.returnValue = dbApi.addProduct(payload);
  } catch (error) {
    event.returnValue = { error: error.message };
  }
});

ipcMain.on("products:update:sync", (event, payload) => {
  try {
    event.returnValue = dbApi.updateProduct(payload);
  } catch (error) {
    event.returnValue = { error: error.message };
  }
});

ipcMain.on("products:delete:sync", (event, productId) => {
  try {
    event.returnValue = dbApi.deleteProduct(productId);
  } catch (error) {
    event.returnValue = { error: error.message };
  }
});

// ===== INVOICES =====
ipcMain.on("invoices:create:sync", (event, payload) => {
  try {
    event.returnValue = dbApi.createInvoice(payload);
  } catch (error) {
    event.returnValue = { error: error.message };
  }
});

ipcMain.on("invoices:get:sync", (event) => {
  event.returnValue = dbApi.getInvoices();
});

// ===== RESERVATIONS =====
ipcMain.on("reservations:create:sync", (event, payload) => {
  try {
    event.returnValue = dbApi.createReservation(payload);
  } catch (error) {
    event.returnValue = { error: error.message };
  }
});

// ===== DASHBOARD =====
ipcMain.on("dashboard:get:sync", (event) => {
  event.returnValue = dbApi.getDashboard();
});

// ===== AUDIT LOGS =====
ipcMain.on("audit:getLogs:sync", (event, filters) => {
  event.returnValue = dbApi.getAuditLogs(filters);
});

// ===== BACKUP & RESTORE =====
ipcMain.on("backup:create:sync", (event, description) => {
  event.returnValue = dbApi.createBackup(description);
});

ipcMain.on("backup:list:sync", (event) => {
  event.returnValue = dbApi.listBackups();
});

ipcMain.on("backup:restore:sync", (event, backupPath) => {
  event.returnValue = dbApi.restoreBackup(backupPath);
});

// ===== DATA EXPORT =====
ipcMain.on("data:export:sync", (event) => {
  event.returnValue = dbApi.exportData();
});


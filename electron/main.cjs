// const { app, BrowserWindow, ipcMain } = require("electron");
// const path = require("path");
// const { dbApi } = require("./sqlite.cjs");

// // function createWindow() {
// //   const win = new BrowserWindow({
// //     width: 1400,
// //     height: 900,
// //     webPreferences: {
// //       preload: path.join(__dirname, "preload.cjs"),
// //       contextIsolation: true,
// //       nodeIntegration: false,
// //     },
// //   });

// //   if (process.env.NODE_ENV === "development" && process.env.ELECTRON_START_URL) {
// //     win.loadURL(process.env.ELECTRON_START_URL);
// //   } else {
// //     win.loadFile(path.join(__dirname, "../dist/index.html"));
// //   }
// // }
// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1400,
//     height: 900,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.cjs"),
//       contextIsolation: true,
//       nodeIntegration: false,
//     },
//   });

//   // Add this to see errors
//   win.webContents.openDevTools();

//   if (process.env.NODE_ENV === "development" && process.env.ELECTRON_START_URL) {
//     console.log("Loading development URL:", process.env.ELECTRON_START_URL);
//     win.loadURL(process.env.ELECTRON_START_URL);
//   } else {
//     const indexPath = path.join(__dirname, "../dist/index.html");
//     console.log("Loading production file:", indexPath);
//     win.loadFile(indexPath);
//   }

//   // Add error handling
//   win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
//     console.error('Failed to load:', errorCode, errorDescription);
//   });
// }
// app.whenReady().then(() => {
//   dbApi.init();
//   createWindow();

//   // Cleanup old data periodically
//   setInterval(() => {
//     dbApi.cleanup();
//   }, 24 * 60 * 60 * 1000); // Daily
// });
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { dbApi } = require("./sqlite.cjs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Open DevTools for debugging (remove in production)
  // mainWindow.webContents.openDevTools();

  // Load the app
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ELECTRON_START_URL
  ) {
    console.log("Loading development URL:", process.env.ELECTRON_START_URL);
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    // Production: Load from dist folder
    let indexPath = path.join(__dirname, "../dist/index.html");

    // Check if file exists
    if (!fs.existsSync(indexPath)) {
      console.error("Index.html not found at:", indexPath);
      // Try alternative path
      indexPath = path.join(process.resourcesPath, "dist/index.html");
      console.log("Trying alternative:", indexPath);
    }

    console.log("Loading production file:", indexPath);
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error("Failed to load:", err);
      // Show error in window
      mainWindow.loadURL(`data:text/html,
        <html>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:monospace;">
            <div style="text-align:center;">
              <h1>Error Loading App</h1>
              <p>Could not find index.html</p>
              <p>Path: ${indexPath}</p>
              <p>Error: ${err.message}</p>
            </div>
          </body>
        </html>
      `);
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log("App is ready");
  dbApi.init();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
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
  event.returnValue = dbApi.changePassword(
    payload.oldPassword,
    payload.newPassword,
  );
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

// ========== PHASE 2: PURCHASES MODULE HANDLERS ==========

// ===== SUPPLIERS =====
ipcMain.on("suppliers:list:sync", (event) => {
  event.returnValue = dbApi.suppliers_list();
});

ipcMain.on("suppliers:create:sync", (event, data) => {
  event.returnValue = dbApi.suppliers_create(data);
});

ipcMain.on("suppliers:update:sync", (event, data) => {
  event.returnValue = dbApi.suppliers_update(data);
});

ipcMain.on("suppliers:delete:sync", (event, data) => {
  event.returnValue = dbApi.suppliers_delete(data);
});

// ===== PURCHASE ORDERS =====
ipcMain.on("purchase-orders:list:sync", (event) => {
  event.returnValue = dbApi.purchase_orders_list();
});

ipcMain.on("purchase-orders:create:sync", (event, data) => {
  event.returnValue = dbApi.purchase_orders_create(data);
});

ipcMain.on("purchase-orders:update:sync", (event, data) => {
  event.returnValue = dbApi.purchase_orders_update(data);
});

ipcMain.on("purchase-orders:get:sync", (event, poId) => {
  event.returnValue = dbApi.purchase_orders_get(poId);
});

// ===== PURCHASE ITEMS =====
ipcMain.on("purchase-items:add:sync", (event, data) => {
  event.returnValue = dbApi.purchase_items_add(data);
});

ipcMain.on("purchase-items:list:sync", (event, poId) => {
  event.returnValue = dbApi.purchase_items_list(poId);
});

ipcMain.on("purchase-items:remove:sync", (event, itemId) => {
  event.returnValue = dbApi.purchase_items_remove(itemId);
});

// ===== GOODS RECEIVED =====
ipcMain.on("goods-received:create:sync", (event, data) => {
  event.returnValue = dbApi.goods_received_create(data);
});

ipcMain.on("goods-received:list:sync", (event, poId) => {
  event.returnValue = dbApi.goods_received_list(poId);
});

// ===== SUPPLIER PAYMENTS =====
ipcMain.on("supplier-payments:create:sync", (event, data) => {
  event.returnValue = dbApi.supplier_payments_create(data);
});

ipcMain.on("supplier-payments:list:sync", (event, poId) => {
  event.returnValue = dbApi.supplier_payments_list(poId);
});

ipcMain.on("supplier-payments:by-supplier:sync", (event, supplierId) => {
  event.returnValue = dbApi.supplier_payments_by_supplier(supplierId);
});


// ===== INVOICE ITEMS & PAYMENTS =====
ipcMain.on("invoices:items:get:sync", (event, invoiceId) => {
  try {
    const items = dbApi.getInvoiceItems(invoiceId);
    console.log(`Fetched ${items.length} items for invoice ${invoiceId}`);
    event.returnValue = items;
  } catch (error) {
    console.error("Error getting invoice items:", error);
    event.returnValue = [];
  }
});

ipcMain.on("invoices:payments:get:sync", (event, invoiceId) => {
  try {
    const payments = dbApi.getInvoicePayments(invoiceId);
    event.returnValue = payments;
  } catch (error) {
    console.error("Error getting invoice payments:", error);
    event.returnValue = [];
  }
});
// ========== END PHASE 2: PURCHASES MODULE HANDLERS ==========

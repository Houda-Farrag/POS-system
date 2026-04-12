import type { DashboardStats, Invoice, Product, User, AuditLog, UserCreateRequest, Backup } from "./types";

declare global {
  interface Window {
    electronAPI?: {
      // System
      isReady: () => boolean;
      getCurrentUser: () => User | null;
      
      // Authentication & User Management
      login: (username: string, password: string) => User | null;
      logout: () => void;
      createUser: (payload: UserCreateRequest) => { ok: boolean; user?: User; error?: string };
      updateUser: (userId: number, updates: Partial<User>) => { ok: boolean; user?: User; error?: string };
      deleteUser: (userId: number) => { ok: boolean; error?: string };
      getUsers: () => User[];
      changePassword: (oldPassword: string, newPassword: string) => { ok: boolean; error?: string };
      
      // Permissions & Roles
      getPermissions: (role: string) => string[];
      getAllRoles: () => Array<{ id: string; label: string; description: string }>;
      hasPermission: (permission: string) => boolean;
      
      // Products
      getProducts: () => Product[];
      addProduct: (product: Omit<Product, "id">) => Product;
      updateProduct: (product: Product) => Product;
      deleteProduct: (productId: number) => { ok: boolean };
      
      // Invoices
      createInvoice: (payload: {
        customerName: string;
        taxRate: number;
        paidAmount: number;
        items: Array<{ productId: number; quantity: number }>;
      }) => Invoice;
      getInvoices: () => Invoice[];
      
      // Reservations
      createReservation: (payload: {
        customerName: string;
        items: Array<{ productId: number; quantity: number }>;
      }) => { ok: boolean; reservationCount: number };
      
      // Dashboard
      getDashboard: () => DashboardStats;
      
      // Audit Logs
      getAuditLogs: (filters?: any) => AuditLog[];
      
      // Backup & Restore
      createBackup: (description?: string) => { ok: boolean; backup_path?: string; message?: string; error?: string };
      listBackups: () => Backup[];
      restoreBackup: (backupPath: string) => { ok: boolean; message?: string; error?: string };
      
      // Data Export
      exportData: () => { ok: boolean; data?: any; message?: string; error?: string };
    };
  }
}

export const api = {
  // System
  isConnected: () => Boolean(window.electronAPI?.isReady?.()),
  getCurrentUser: () => window.electronAPI?.getCurrentUser?.() ?? null,
  
  // Authentication & User Management
  login: (username: string, password: string) => window.electronAPI?.login(username, password) ?? null,
  logout: () => window.electronAPI?.logout?.(),
  createUser: (payload: UserCreateRequest) => window.electronAPI?.createUser(payload) ?? { ok: false },
  updateUser: (userId: number, updates: Partial<User>) => window.electronAPI?.updateUser(userId, updates) ?? { ok: false },
  deleteUser: (userId: number) => window.electronAPI?.deleteUser(userId) ?? { ok: false },
  getUsers: () => window.electronAPI?.getUsers() ?? [],
  changePassword: (oldPassword: string, newPassword: string) => window.electronAPI?.changePassword(oldPassword, newPassword) ?? { ok: false },
  
  // Permissions & Roles
  getPermissions: (role: string) => window.electronAPI?.getPermissions(role) ?? [],
  getAllRoles: () => window.electronAPI?.getAllRoles?.() ?? [],
  hasPermission: (permission: string) => window.electronAPI?.hasPermission(permission) ?? false,
  
  // Products
  getProducts: () => window.electronAPI?.getProducts() ?? [],
  addProduct: (product: Omit<Product, "id">) => window.electronAPI?.addProduct(product),
  updateProduct: (product: Product) => window.electronAPI?.updateProduct(product),
  deleteProduct: (productId: number) => window.electronAPI?.deleteProduct(productId),
  
  // Invoices
  createInvoice: (payload: {
    customerName: string;
    taxRate: number;
    paidAmount: number;
    items: Array<{ productId: number; quantity: number }>;
  }) => window.electronAPI?.createInvoice(payload),
  getInvoices: () => window.electronAPI?.getInvoices() ?? [],
  
  // Reservations
  createReservation: (payload: { customerName: string; items: Array<{ productId: number; quantity: number }> }) =>
    window.electronAPI?.createReservation(payload),
  
  // Dashboard
  getDashboard: () =>
    window.electronAPI?.getDashboard() ?? {
      totalSales: 0,
      unpaidBalance: 0,
      invoiceCount: 0,
      topProducts: [],
    },
  
  // Audit Logs
  getAuditLogs: (filters?: any) => window.electronAPI?.getAuditLogs(filters) ?? [],
  
  // Backup & Restore
  createBackup: (description?: string) => window.electronAPI?.createBackup(description) ?? { ok: false },
  listBackups: () => window.electronAPI?.listBackups() ?? [],
  restoreBackup: (backupPath: string) => window.electronAPI?.restoreBackup(backupPath) ?? { ok: false },
  
  // Data Export
  exportData: () => window.electronAPI?.exportData() ?? { ok: false },
};

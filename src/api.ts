import type {
  DashboardStats,
  Invoice,
  Product,
  User,
  AuditLog,
  UserCreateRequest,
  Backup,
  Payment,
} from "./types";

declare global {
  interface Window {
    electronAPI?: {
      // System
      isReady: () => boolean;
      getCurrentUser: () => User | null;

      // Authentication & User Management
      login: (username: string, password: string) => User | null;
      logout: () => void;
      createUser: (payload: UserCreateRequest) => {
        ok: boolean;
        user?: User;
        error?: string;
      };
      updateUser: (
        userId: number,
        updates: Partial<User>,
      ) => { ok: boolean; user?: User; error?: string };
      deleteUser: (userId: number) => { ok: boolean; error?: string };
      getUsers: () => User[];
      changePassword: (
        oldPassword: string,
        newPassword: string,
      ) => { ok: boolean; error?: string };

      // Permissions & Roles
      getPermissions: (role: string) => string[];
      getAllRoles: () => Array<{
        id: string;
        label: string;
        description: string;
      }>;
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

      updateInvoice: (invoiceId: number, updates: Partial<Invoice>) => Invoice;
      deleteInvoice: (invoiceId: number) => { ok: boolean };

      // Payments
      getPaymentsByInvoice: (invoiceId: number) => Payment[];
      addPayment: (invoiceId: number, amount: number) => { ok: boolean };

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
      createBackup: (description?: string) => {
        ok: boolean;
        backup_path?: string;
        message?: string;
        error?: string;
      };
      listBackups: () => Backup[];
      restoreBackup: (backupPath: string) => {
        ok: boolean;
        message?: string;
        error?: string;
      };

      // Data Export
      exportData: () => {
        ok: boolean;
        data?: any;
        message?: string;
        error?: string;
      };

      // Phase 2: Purchases Module
      suppliers_list: () => any[];
      suppliers_create: (data: any) => { ok: boolean; supplier?: any; error?: string };
      suppliers_update: (data: any) => {
          [x: string]: any; ok: boolean; error?: string 
};
      suppliers_delete: (data: any) => { ok: boolean; error?: string };

      purchase_orders_list: () => any[];
      purchase_orders_create: (data: any) => { ok: boolean; po?: any; error?: string };
      purchase_orders_update: (data: any) => { ok: boolean; error?: string };
      purchase_orders_get: (poId: number) => any;

      purchase_items_add: (data: any) => { ok: boolean; item?: any; error?: string };
      purchase_items_list: (poId: number) => any[];
      purchase_items_remove: (itemId: number) => { ok: boolean; error?: string };

      goods_received_create: (data: any) => { ok: boolean; receipt?: any; error?: string };
      goods_received_list: (poId: number) => any[];

      supplier_payments_create: (data: any) => { ok: boolean; payment?: any; error?: string };
      supplier_payments_list: (poId: number) => any[];
      supplier_payments_by_supplier: (supplierId: number) => any[];
    };
  }
}

export const api = {
  // System
  isConnected: () => Boolean(window.electronAPI?.isReady?.()),
  getCurrentUser: () => window.electronAPI?.getCurrentUser?.() ?? null,

  // Authentication & User Management
  login: (username: string, password: string) =>
    window.electronAPI?.login(username, password) ?? null,
  logout: () => window.electronAPI?.logout?.(),
  createUser: (payload: UserCreateRequest) =>
    window.electronAPI?.createUser(payload) ?? { ok: false },
  updateUser: (userId: number, updates: Partial<User>) =>
    window.electronAPI?.updateUser(userId, updates) ?? { ok: false },
  deleteUser: (userId: number) =>
    window.electronAPI?.deleteUser(userId) ?? { ok: false },
  getUsers: () => window.electronAPI?.getUsers() ?? [],
  changePassword: (oldPassword: string, newPassword: string) =>
    window.electronAPI?.changePassword(oldPassword, newPassword) ?? {
      ok: false,
    },

  // Permissions & Roles
  getPermissions: (role: string) =>
    window.electronAPI?.getPermissions(role) ?? [],
  getAllRoles: () => window.electronAPI?.getAllRoles?.() ?? [],
  hasPermission: (permission: string) =>
    window.electronAPI?.hasPermission(permission) ?? false,

  // Products
  getProducts: () => window.electronAPI?.getProducts() ?? [],
  addProduct: (product: Omit<Product, "id">) =>
    window.electronAPI?.addProduct(product),
  updateProduct: (product: Product) =>
    window.electronAPI?.updateProduct(product),
  deleteProduct: (productId: number) =>
    window.electronAPI?.deleteProduct(productId),

  // Invoices
  createInvoice: (payload: {
    customerName: string;
    taxRate: number;
    paidAmount: number;
    items: Array<{ productId: number; quantity: number }>;
  }) => window.electronAPI?.createInvoice(payload),
  getInvoices: () => window.electronAPI?.getInvoices() ?? [],

  // Reservations
  createReservation: (payload: {
    customerName: string;
    items: Array<{ productId: number; quantity: number }>;
  }) => window.electronAPI?.createReservation(payload),

  // Dashboard
  getDashboard: () =>
    window.electronAPI?.getDashboard() ?? {
      totalSales: 0,
      unpaidBalance: 0,
      invoiceCount: 0,
      topProducts: [],
    },

  // Audit Logs
  getAuditLogs: (filters?: any) =>
    window.electronAPI?.getAuditLogs(filters) ?? [],

  // Backup & Restore
  createBackup: (description?: string) =>
    window.electronAPI?.createBackup(description) ?? { ok: false },
  listBackups: () => window.electronAPI?.listBackups() ?? [],
  restoreBackup: (backupPath: string) =>
    window.electronAPI?.restoreBackup(backupPath) ?? { ok: false },

  // Data Export
  exportData: () => window.electronAPI?.exportData() ?? { ok: false },

  // ========== PHASE 2: PURCHASES MODULE ==========

  // Suppliers
  suppliers: {
    list: (): Supplier[] => window.electronAPI?.suppliers_list?.() ?? [],
    create: (data: Omit<Supplier, "id" | "is_active">) => 
      window.electronAPI?.suppliers_create?.(data) ?? { ok: false },
    update: (id: number, data: Partial<Supplier>) =>
      window.electronAPI?.suppliers_update?.({ id, ...data }) ?? { ok: false },
    delete: (id: number) =>
      window.electronAPI?.suppliers_delete?.({ id }) ?? { ok: false },
  },

  // Purchase Orders
  purchaseOrders: {
    list: (): PurchaseOrder[] => window.electronAPI?.purchase_orders_list?.() ?? [],
    create: (data: { supplier_id: number; expected_delivery?: string; notes?: string }) =>
      window.electronAPI?.purchase_orders_create?.(data) ?? { ok: false },
    update: (id: number, data: Partial<PurchaseOrder>) =>
      window.electronAPI?.purchase_orders_update?.({ id, ...data }) ?? { ok: false },
    get: (poId: number) =>
      window.electronAPI?.purchase_orders_get?.(poId) ?? null,
  },

  // Purchase Items
  purchaseItems: {
    add: (data: {
      purchase_order_id: number;
      product_id: number;
      quantity_ordered: number;
      unit_price: number;
      line_total: number;
      tax_rate?: number;
      notes?: string;
    }) => window.electronAPI?.purchase_items_add?.(data) ?? { ok: false },
    list: (poId: number): PurchaseItem[] =>
      window.electronAPI?.purchase_items_list?.(poId) ?? [],
    remove: (itemId: number) =>
      window.electronAPI?.purchase_items_remove?.(itemId) ?? { ok: false },
  },

  // Goods Received
  goodsReceived: {
    create: (data: {
      purchase_order_id: number;
      total_items: number;
      damaged_items?: number;
      items: Array<{ product_id: number; quantity_received: number }>;
      notes?: string;
    }) => window.electronAPI?.goods_received_create?.(data) ?? { ok: false },
    list: (poId: number): GoodsReceived[] =>
      window.electronAPI?.goods_received_list?.(poId) ?? [],
  },

  // Supplier Payments
  supplierPayments: {
    create: (data: {
      purchase_order_id: number;
      supplier_id: number;
      amount_paid: number;
      payment_method: string;
      reference_number?: string;
      notes?: string;
    }) => window.electronAPI?.supplier_payments_create?.(data) ?? { ok: false },
    list: (poId: number): SupplierPayment[] =>
      window.electronAPI?.supplier_payments_list?.(poId) ?? [],
    bySupplier: (supplierId: number): SupplierPayment[] =>
      window.electronAPI?.supplier_payments_by_supplier?.(supplierId) ?? [],
  },
};

// Import types
import type {
  Supplier,
  PurchaseOrder,
  PurchaseItem,
  GoodsReceived,
  SupplierPayment,
} from "./types";

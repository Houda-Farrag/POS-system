export type UserRole = "admin" | "manager" | "accountant" | "cashier" | "warehouse";

export interface User {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
  display_name: string;
  is_active: number;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  email: string;
  role: UserRole;
  display_name: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  display_name: string;
  action: string;
  table_name: string;
  record_id: number;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

export interface Product {
  id: number;
  name: string;
  unit: string;
  price: number;
  stock: number;
  available_stock?: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: "unpaid" | "partial" | "paid";
  date: string;
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  date: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface DashboardStats {
  totalSales: number;
  unpaidBalance: number;
  invoiceCount: number;
  topProducts: Array<{ name: string; qty: number }>;
}

export interface Permission {
  role: UserRole;
  permission: string;
  can_perform: number;
}

export interface Backup {
  id: number;
  backup_path: string;
  backup_size: number;
  created_by: number;
  created_at: string;
  restored_at?: string;
  description?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ========== PHASE 2: PURCHASES MODULE TYPES ==========

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  payment_terms?: string;
  tax_id?: string;
  is_active: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  supplier_name?: string;
  order_date: string;
  expected_delivery?: string;
  actual_delivery?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "submitted" | "received" | "cancelled";
  created_by?: number;
  created_by_name?: string;
  notes?: string;
}

export interface PurchaseItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  product_name?: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  line_total: number;
  received_qty: number;
  notes?: string;
}

export interface GoodsReceived {
  id: number;
  purchase_order_id: number;
  received_date: string;
  received_by: number;
  received_by_name?: string;
  total_items: number;
  damaged_items: number;
  notes?: string;
}

export interface SupplierPayment {
  id: number;
  purchase_order_id: number;
  supplier_id: number;
  supplier_name?: string;
  amount_paid: number;
  payment_date: string;
  payment_method: "cash" | "check" | "bank_transfer" | "credit";
  reference_number?: string;
  notes?: string;
  created_by?: number;
}

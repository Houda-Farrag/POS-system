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

// src/services/invoiceLogic.ts
import { api } from "../api";

export const invoiceLogic = {
  getAll() {
    return api.getInvoices();
  },

  getById(id: number) {
    return api.getInvoices().find(inv => inv.id === id);
  },

  getBalance(invoice: any) {
    return Math.max(0, invoice.total_amount - invoice.paid_amount);
  },

  canEdit(invoice: any) {
    const can = api.hasPermission("invoices:update");
    return can && invoice.paid_amount === 0;
  },

  canDelete(invoice: any) {
    const can = api.hasPermission("invoices:delete");
    return can && invoice.paid_amount === 0;
  }
};
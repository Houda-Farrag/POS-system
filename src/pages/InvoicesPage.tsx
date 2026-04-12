import { useMemo } from "react";
import { api } from "../api";

export function InvoicesPage({ arabicMode }: { arabicMode: boolean }) {
  const invoices = useMemo(() => api.getInvoices(), []);

  return (
    <section className="card">
      <h3>{arabicMode ? "الفواتير" : "Invoices"}</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>{arabicMode ? "العميل" : "Customer"}</th>
            <th>{arabicMode ? "الإجمالي" : "Total"}</th>
            <th>{arabicMode ? "المدفوع" : "Paid"}</th>
            <th>{arabicMode ? "الحالة" : "Status"}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoice_number}</td>
              <td>{inv.customer_name}</td>
              <td>{inv.total_amount.toFixed(2)}</td>
              <td>{inv.paid_amount.toFixed(2)}</td>
              <td><span className={`status ${inv.status}`}>{inv.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

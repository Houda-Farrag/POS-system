import { useMemo, useState } from "react";
// import { api } from "../api";
import { invoiceLogic } from "../services/invoiceLogic";
import type { Invoice } from "../types";
// import type { Invoice } from "../types";

export function InvoicesPage({ arabicMode }: { arabicMode: boolean }) {
  const invoices = useMemo(() => invoiceLogic.getAll(), []);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  return (
    <section className="card" style={{ maxHeight: "80vh", overflowY: "auto", position: "relative" }}>
      <h3>{arabicMode ? "الفواتير" : "Invoices"}</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>{arabicMode ? "العميل" : "Customer"}</th>
            <th>{arabicMode ? "الإجمالي" : "Total"}</th>
            <th>{arabicMode ? "المدفوع" : "Paid"}</th>
            <th>{arabicMode ? "الحالة" : "Status"}</th>
            <th>{arabicMode ? "الإجراءات" : "Actions"}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoice_number}</td>
              <td>{inv.customer_name}</td>
              <td>{inv.total_amount.toFixed(2)}</td>
              <td>{inv.paid_amount.toFixed(2)}</td>
              <td>
                <span className={`status ${inv.status}`}>{inv.status}</span>
              </td>
              <td>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedInvoice(inv)}
                >
                  {arabicMode ? "عرض التفاصيل" : "View Details"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedInvoice && (
        <div className="modal">
          <h3>Invoice #{selectedInvoice.invoice_number}</h3>
          <p>{selectedInvoice.customer_name}</p>

          <p>
            Total: {selectedInvoice.total_amount} | Paid:{" "}
            {selectedInvoice.paid_amount}
          </p>

          <button onClick={() => setSelectedInvoice(null)}>Close</button>
        </div>
      )}
    </section>
  );
}

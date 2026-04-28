// src/components/InvoiceDetails.tsx
import { useRef, useState, useEffect } from "react";
import { api } from "../api";
import type { Invoice } from "../types";

interface InvoiceDetailsProps {
  invoice: Invoice;
  arabicMode?: boolean;
}

interface InvoiceItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Payment {
  id: number;
  amount: number;
  date: string;
}

export function InvoiceDetails({ invoice, arabicMode = false }: InvoiceDetailsProps) {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load invoice items and payments
    const loadDetails = async () => {
      try {
        console.log("Loading items for invoice ID:", invoice.id); // Debug log
        // These are synchronous calls from Electron, but handle errors gracefully
        const invoiceItems = api.getInvoiceItems(invoice.id);
        const invoicePayments = api.getInvoicePayments(invoice.id);
        
        console.log("Loaded items:", invoiceItems); // Debug log
        console.log("Loaded payments:", invoicePayments); // Debug log
        
        setItems(invoiceItems || []);
        setPayments(invoicePayments || []);
      } catch (error) {
        console.error("Error loading invoice details:", error);
        setError(arabicMode ? "خطأ في تحميل تفاصيل الفاتورة" : "Error loading invoice details");
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [invoice.id, arabicMode]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalTitle = document.title;
    document.title = `Invoice ${invoice.invoice_number}`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert(arabicMode ? "يرجى السماح بالنوافذ المنبثقة للطباعة" : "Please allow popups for printing");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              direction: ${arabicMode ? "rtl" : "ltr"};
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ddd;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #333;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: ${arabicMode ? "right" : "left"};
            }
            th {
              background-color: #f2f2f2;
            }
            .totals {
              text-align: ${arabicMode ? "left" : "right"};
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();

    document.title = originalTitle;
  };

  const balance = invoice.total_amount - invoice.paid_amount;
  const remainingDue = balance > 0 ? balance : 0;

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>{arabicMode ? "جاري تحميل تفاصيل الفاتورة..." : "Loading invoice details..."}</div>;
  }

  if (error) {
    return <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>{error}</div>;
  }

  return (
    <div>
      {/* Printable Content */}
      <div ref={printRef} id="print-area">
        <div className="invoice-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0 }}>{arabicMode ? "فاتورة ضريبية" : "TAX INVOICE"}</h2>
          <p style={{ color: "#666", margin: "0.25rem 0" }}>
            {arabicMode ? "رقم الفاتورة" : "Invoice No"}: {invoice.invoice_number}
          </p>
          <p style={{ color: "#666", margin: 0 }}>
            {arabicMode ? "التاريخ" : "Date"}: {new Date(invoice.date).toLocaleDateString()}
          </p>
        </div>

        <div className="invoice-customer" style={{ marginBottom: "1.5rem", padding: "0.5rem 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
          <strong>{arabicMode ? "العميل" : "Customer"}:</strong> {invoice.customer_name}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              <th style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: arabicMode ? "right" : "left" }}>
                {arabicMode ? "المنتج" : "Product"}
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: "center" }}>
                {arabicMode ? "الكمية" : "Qty"}
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: arabicMode ? "left" : "right" }}>
                {arabicMode ? "سعر الوحدة" : "Unit Price"}
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: arabicMode ? "left" : "right" }}>
                {arabicMode ? "الإجمالي" : "Total"}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id}>
                  <td style={{ border: "1px solid #e5e7eb", padding: "0.5rem" }}>{item.product_name}</td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: arabicMode ? "left" : "right" }}>
                    {item.unit_price.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: arabicMode ? "left" : "right" }}>
                    {item.line_total.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: "center", color: "#999" }}>
                  {arabicMode ? "لا توجد منتجات" : "No products available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="invoice-summary" style={{ textAlign: arabicMode ? "left" : "right", marginTop: "1rem" }}>
          <p style={{ margin: "0.25rem 0" }}>
            <strong>{arabicMode ? "المجموع الفرعي" : "Subtotal"}:</strong> {invoice.subtotal.toFixed(2)}
          </p>
          <p style={{ margin: "0.25rem 0" }}>
            <strong>{arabicMode ? "الضريبة" : "Tax"}:</strong> {invoice.tax_amount.toFixed(2)}
          </p>
          <p style={{ margin: "0.25rem 0", fontSize: "1.1rem" }}>
            <strong>{arabicMode ? "الإجمالي" : "Total"}:</strong> {invoice.total_amount.toFixed(2)}
          </p>
          <p style={{ margin: "0.25rem 0" }}>
            <strong>{arabicMode ? "المدفوع" : "Paid"}:</strong> {invoice.paid_amount.toFixed(2)}
          </p>
          <p style={{ margin: "0.25rem 0", color: remainingDue > 0 ? "#dc2626" : "#059669" }}>
            <strong>{arabicMode ? "المتبقي" : "Due"}:</strong> {remainingDue.toFixed(2)}
          </p>
        </div>

        {payments.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <h4 style={{ marginBottom: "0.5rem" }}>{arabicMode ? "سجل المدفوعات" : "Payment History"}</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: arabicMode ? "right" : "left" }}>
                    {arabicMode ? "التاريخ" : "Date"}
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: arabicMode ? "left" : "right" }}>
                    {arabicMode ? "المبلغ" : "Amount"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td style={{ border: "1px solid #e5e7eb", padding: "0.5rem" }}>
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "0.5rem", textAlign: arabicMode ? "left" : "right" }}>
                      {payment.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="invoice-footer" style={{ textAlign: "center", marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #eee", fontSize: "0.75rem", color: "#999" }}>
          {arabicMode ? "شكراً لتسوقكم معنا" : "Thank you for your business"}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
        <button
          onClick={handlePrint}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#2c3e50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🖨️ {arabicMode ? "طباعة" : "Print"}
        </button>
      </div>
    </div>
  );
}
// import { useState, useEffect } from "react";
// import { api } from "../api";
// import type { Invoice, Payment } from "../types";
// import { formatMoney, formatDate, escapeHtml } from "../utils/formatters";

// interface InvoiceDetailModalProps {
//   invoice: Invoice;
//   arabicMode: boolean;
//   userRole: string;
//   onClose: () => void;
//   onPaymentAdded: () => void;
// }

// export function InvoiceDetailModal({
//   invoice,
//   arabicMode,
//   userRole,
//   onClose,
//   onPaymentAdded,
// }: InvoiceDetailModalProps) {
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [showPaymentInput, setShowPaymentInput] = useState(false);
//   const [paymentAmount, setPaymentAmount] = useState("");
//   const [items, setItems] = useState<any[]>([]);

//   const balance = Math.max(0, invoice.total_amount - invoice.paid_amount);
//   const canAddPayment = userRole !== "stakeholder" && balance > 0;

//   useEffect(() => {
//     loadPayments();
//     loadInvoiceItems();
//   }, [invoice.id]);

//   const loadPayments = () => {
//     setPayments(api.getPaymentsByInvoiceId(invoice.id));
//   };

//   const loadInvoiceItems = () => {
//     setItems(api.getInvoiceItems(invoice.id));
//   };

//   const handlePrint = () => {
//     const receiptHtml = buildReceiptHtml();
//     const printWindow = window.open("", "_blank");
//     if (printWindow) {
//       printWindow.document.write(receiptHtml);
//       printWindow.document.close();
//       printWindow.print();
//     }
//   };

//   const handleAddPayment = () => {
//     const amount = parseFloat(paymentAmount);
//     if (isNaN(amount) || amount <= 0 || amount > balance + 0.001) {
//       alert(arabicMode ? "مبلغ غير صالح" : "Invalid amount");
//       return;
//     }

//     api.addPayment(invoice.id, amount);
//     onPaymentAdded();
//     loadPayments();
//     setPaymentAmount("");
//     setShowPaymentInput(false);
//   };

//   const buildReceiptHtml = () => {
//     const rows = items
//       .map(
//         (item) => `
//       <tr>
//         <td style="padding:4px;">${escapeHtml(item.name)}</td>
//         <td style="padding:4px;">${item.quantity}</td>
//         <td style="padding:4px;">${formatMoney(item.unit_price)}</td>
//         <td style="padding:4px;">${formatMoney(item.quantity * item.unit_price)}</td>
//       </tr>
//     `
//       )
//       .join("");

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Invoice #${invoice.invoice_number}</title>
//         <style>
//           body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; }
//           .receipt { max-width: 400px; margin: 0 auto; }
//           .header { text-align: center; margin-bottom: 20px; }
//           .title { font-size: 20px; font-weight: bold; }
//           .subtitle { color: #B8860B; font-size: 11px; }
//           hr { border: none; border-top: 1px solid #E0E0E0; margin: 12px 0; }
//           table { width: 100%; border-collapse: collapse; font-size: 12px; }
//           td, th { padding: 4px; text-align: left; }
//           .total-row { font-weight: bold; margin-top: 10px; }
//           @media print {
//             body { margin: 0; }
//             .no-print { display: none; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="receipt">
//           <div class="header">
//             <div class="title">أولاد السمان</div>
//             <div class="subtitle">Building Materials</div>
//           </div>
//           <hr>
//           <p><strong>Invoice:</strong> #${invoice.invoice_number}</p>
//           <p><strong>Date:</strong> ${formatDate(invoice.date)}</p>
//           <p><strong>Customer:</strong> ${escapeHtml(invoice.customer_name)}</p>
//           <table>
//             <thead>
//               <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
//             </thead>
//             <tbody>${rows}</tbody>
//            </table>
//           <hr>
//           <p><strong>Total:</strong> ${formatMoney(invoice.total_amount)}</p>
//           <p><strong>Paid:</strong> ${formatMoney(invoice.paid_amount)}</p>
//           <p><strong>Balance due:</strong> ${formatMoney(balance)}</p>
//           <p><strong>Status:</strong> ${invoice.status}</p>
//         </div>
//       </body>
//       </html>
//     `;
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-container" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h3>
//             {arabicMode ? `فاتورة #${invoice.invoice_number}` : `Invoice #${invoice.invoice_number}`}
//           </h3>
//           <button className="modal-close" onClick={onClose}>
//             &times;
//           </button>
//         </div>

//         <div className="modal-body">
//           <div className="invoice-info">
//             <p>
//               <strong>{arabicMode ? "التاريخ:" : "Date:"}</strong> {formatDate(invoice.date)}
//             </p>
//             <p>
//               <strong>{arabicMode ? "العميل:" : "Customer:"}</strong> {invoice.customer_name}
//             </p>
//           </div>

//           <div className="items-table">
//             <table className="data-table">
//               <thead>
//                 <tr>
//                   <th>{arabicMode ? "المنتج" : "Item"}</th>
//                   <th>{arabicMode ? "الكمية" : "Qty"}</th>
//                   <th>{arabicMode ? "السعر" : "Price"}</th>
//                   <th>{arabicMode ? "الإجمالي" : "Total"}</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((item, idx) => (
//                   <tr key={idx}>
//                     <td>{item.name}</td>
//                     <td>{item.quantity}</td>
//                     <td>{formatMoney(item.unit_price)}</td>
//                     <td>{formatMoney(item.quantity * item.unit_price)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="totals-section">
//             <p>
//               <strong>{arabicMode ? "الإجمالي:" : "Total:"}</strong> {formatMoney(invoice.total_amount)}
//             </p>
//             <p>
//               <strong>{arabicMode ? "المدفوع:" : "Paid:"}</strong> {formatMoney(invoice.paid_amount)}
//             </p>
//             <p className="balance">
//               <strong>{arabicMode ? "المتبقي:" : "Balance:"}</strong> {formatMoney(balance)}
//             </p>
//           </div>

//           <div className="payments-section">
//             <strong>{arabicMode ? "المدفوعات:" : "Payments:"}</strong>
//             <ul>
//               {payments.length > 0 ? (
//                 payments.map((p, idx) => (
//                   <li key={idx}>
//                     {formatMoney(p.amount)} on {formatDate(p.date)}
//                   </li>
//                 ))
//               ) : (
//                 <li>{arabicMode ? "لا توجد مدفوعات" : "No payments"}</li>
//               )}
//             </ul>
//           </div>

//           {showPaymentInput && (
//             <div className="payment-input">
//               <input
//                 type="number"
//                 placeholder={arabicMode ? "المبلغ" : "Amount"}
//                 value={paymentAmount}
//                 onChange={(e) => setPaymentAmount(e.target.value)}
//                 step="0.01"
//               />
//               <div className="payment-actions">
//                 <button onClick={handleAddPayment} className="btn-primary">
//                   {arabicMode ? "تأكيد" : "Confirm"}
//                 </button>
//                 <button onClick={() => setShowPaymentInput(false)} className="btn-secondary">
//                   {arabicMode ? "إلغاء" : "Cancel"}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="modal-footer">
//           <button onClick={handlePrint} className="btn-secondary">
//             🖨️ {arabicMode ? "طباعة" : "Print"}
//           </button>
//           {canAddPayment && !showPaymentInput && (
//             <button onClick={() => setShowPaymentInput(true)} className="btn-primary">
//               💰 {arabicMode ? "إضافة دفعة" : "Add Payment"}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
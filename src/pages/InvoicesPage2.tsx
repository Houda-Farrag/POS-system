// import { useState, useMemo, useEffect } from "react";
// import { api } from "../api";
// import { Invoice, Payment } from "../types";
// import { InvoiceDetailModal } from "./InvoiceDetailModal";
// import { formatMoney, formatDate } from "../utils/formatters";

// interface InvoicesPageProps {
//   arabicMode: boolean;
//   userRole?: string;
// }

// export function InvoicesPage({ arabicMode, userRole = "admin" }: InvoicesPageProps) {
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     loadInvoices();
//   }, []);

//   const loadInvoices = () => {
//     setInvoices(api.getInvoices());
//   };

//   const filteredInvoices = useMemo(() => {
//     if (!searchTerm) return invoices;
    
//     const term = searchTerm.toLowerCase();
//     return invoices.filter(
//       (inv) =>
//         inv.invoice_number.toLowerCase().includes(term) ||
//         inv.customer_name.toLowerCase().includes(term)
//     );
//   }, [invoices, searchTerm]);

//   const handleInvoiceClick = (invoice: Invoice) => {
//     setSelectedInvoice(invoice);
//     setShowModal(true);
//   };

//   const handlePaymentAdded = () => {
//     loadInvoices(); // Refresh the list
//     if (selectedInvoice) {
//       const updated = api.getInvoiceById(selectedInvoice.id);
//       if (updated) setSelectedInvoice(updated);
//     }
//   };

//   return (
//     <>
//       <section className="card">
//         <div className="card-header">
//           <h3>{arabicMode ? "الفواتير" : "Invoices"}</h3>
//           <input
//             type="search"
//             placeholder={arabicMode ? "بحث عن عميل أو رقم فاتورة..." : "Search customer or invoice #..."}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="search-input"
//           />
//         </div>

//         <div className="table-responsive">
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>{arabicMode ? "التاريخ" : "Date"}</th>
//                 <th>{arabicMode ? "العميل" : "Customer"}</th>
//                 <th>{arabicMode ? "الإجمالي" : "Total"}</th>
//                 <th>{arabicMode ? "المدفوع" : "Paid"}</th>
//                 <th>{arabicMode ? "المتبقي" : "Balance"}</th>
//                 <th>{arabicMode ? "الحالة" : "Status"}</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredInvoices.map((inv) => {
//                 const balance = Math.max(0, inv.total_amount - inv.paid_amount);
//                 return (
//                   <tr
//                     key={inv.id}
//                     onClick={() => handleInvoiceClick(inv)}
//                     className="clickable-row"
//                   >
//                     <td className="font-medium">{inv.invoice_number}</td>
//                     <td>{formatDate(inv.date)}</td>
//                     <td>{inv.customer_name}</td>
//                     <td>{formatMoney(inv.total_amount)}</td>
//                     <td>{formatMoney(inv.paid_amount)}</td>
//                     <td>{formatMoney(balance)}</td>
//                     <td>
//                       <span className={`status-badge status-${inv.status}`}>
//                         {arabicMode 
//                           ? inv.status === "paid" ? "مدفوعة" 
//                             : inv.status === "partial" ? "مدفوعة جزئياً" 
//                             : "غير مدفوعة"
//                           : inv.status}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </section>

//       {showModal && selectedInvoice && (
//         <InvoiceDetailModal
//           invoice={selectedInvoice}
//           arabicMode={arabicMode}
//           userRole={userRole}
//           onClose={() => setShowModal(false)}
//           onPaymentAdded={handlePaymentAdded}
//         />
//       )}
//     </>
//   );
// }
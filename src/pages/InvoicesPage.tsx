// import { useMemo, useState, useRef } from "react";
// import { api } from "../api";
// import { invoiceLogic } from "../services/invoiceLogic";
// import type { Invoice, InvoiceItem } from "../types";

// export function InvoicesPage({ arabicMode }: { arabicMode: boolean }) {
//   const invoices = useMemo(() => invoiceLogic.getAll(), []);
//   const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
//   const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
//   const printRef = useRef<HTMLDivElement>(null);

//   const handleViewDetails = (invoice: Invoice) => {
//     setSelectedInvoice(invoice);
//     const items = api.getInvoiceItems(invoice.id);
//     setInvoiceItems(items);
//   };

//   const handlePrint = () => {
//     if (!printRef.current) return;
    
//     const printWindow = window.open("", "", "width=900,height=700");
//     if (!printWindow) {
//       alert(arabicMode ? "يرجى السماح بفتح النوافذ المنبثقة" : "Please allow pop-ups");
//       return;
//     }

//     const printContent = printRef.current.innerHTML;
//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html dir="${arabicMode ? 'rtl' : 'ltr'}">
//         <head>
//           <meta charset="UTF-8">
//           <title>Invoice ${selectedInvoice?.invoice_number}</title>
//           <style>
//             * { margin: 0; padding: 0; box-sizing: border-box; }
//             body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; background: white; }
//             .print-container { max-width: 900px; margin: 0 auto; }
//             .invoice-header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 25px; margin-bottom: 30px; }
//             .company-name { font-size: 28px; font-weight: 800; color: #1e40af; margin-bottom: 5px; }
//             .company-info { font-size: 13px; color: #666; }
//             .invoice-title { font-size: 20px; font-weight: bold; margin-top: 15px; color: #333; }
//             .invoice-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; margin-top: 20px; }
//             .meta-block { border-left: 4px solid #3b82f6; padding-left: 15px; }
//             .meta-block h4 { font-size: 12px; font-weight: 700; color: #3b82f6; text-transform: uppercase; margin-bottom: 8px; }
//             .meta-block p { font-size: 14px; color: #333; margin-bottom: 4px; }
//             table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
//             th { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 13px; }
//             td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
//             tbody tr:hover { background-color: #f3f4f6; }
//             tbody tr:last-child td { border-bottom: 2px solid #3b82f6; }
//             .totals-section { display: flex; justify-content: flex-end; margin-bottom: 30px; }
//             .totals-box { width: 350px; border: 2px solid #3b82f6; border-radius: 8px; overflow: hidden; }
//             .total-row { display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
//             .total-row.amount { font-weight: 600; }
//             .total-row.grand-total { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; font-size: 15px; font-weight: 700; border: none; }
//             .total-row.balance { background-color: #dbeafe; color: #1e40af; font-weight: 600; }
//             .footer { text-align: center; font-size: 12px; color: #666; padding-top: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
//             .footer p { margin-bottom: 5px; }
//             @media print {
//               body { margin: 0; padding: 20px; }
//               .print-container { max-width: 100%; }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="print-container">
//             ${printContent}
//           </div>
//           <script>
//             window.print();
//             window.onafterprint = () => window.close();
//           </script>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   const getStatusLabel = (status: string) => {
//     const statusMap: { [key: string]: { ar: string; en: string } } = {
//       unpaid: { ar: "غير مدفوعة", en: "Unpaid" },
//       partial: { ar: "مدفوعة جزئياً", en: "Partial" },
//       paid: { ar: "مدفوعة", en: "Paid" },
//     };
//     return arabicMode ? statusMap[status]?.ar : statusMap[status]?.en;
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "paid":
//         return "✓";
//       case "partial":
//         return "⚠";
//       case "unpaid":
//         return "✕";
//       default:
//         return "•";
//     }
//   };

//   const calculateLineTotal = (item: InvoiceItem) => {
//     return item.quantity * item.unit_price;
//   };

//   const getRemainingBalance = (invoice: Invoice) => {
//     return Math.max(0, invoice.total_amount - invoice.paid_amount);
//   };

//   return (
//     <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
//       {/* Header Section */}
//       <div className="mb-8">
//         <h1 className="text-4xl font-black mb-2 text-slate-800">{arabicMode ? "📄 الفواتير" : "📄 Invoices"}</h1>
//         <p className="text-slate-600 text-lg">{arabicMode ? "إدارة وطباعة فواتيرك بسهولة" : "Manage and print your invoices with ease"}</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//         <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
//           <p className="text-sm text-gray-600 mb-1">{arabicMode ? "إجمالي الفواتير" : "Total Invoices"}</p>
//           <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
//           <p className="text-sm text-gray-600 mb-1">{arabicMode ? "مدفوعة" : "Paid"}</p>
//           <p className="text-2xl font-bold text-green-600">{invoices.filter(i => i.status === "paid").length}</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
//           <p className="text-sm text-gray-600 mb-1">{arabicMode ? "مدفوعة جزئياً" : "Partial"}</p>
//           <p className="text-2xl font-bold text-yellow-600">{invoices.filter(i => i.status === "partial").length}</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
//           <p className="text-sm text-gray-600 mb-1">{arabicMode ? "غير مدفوعة" : "Unpaid"}</p>
//           <p className="text-2xl font-bold text-red-600">{invoices.filter(i => i.status === "unpaid").length}</p>
//         </div>
//       </div>

//       {/* Invoices List */}
//       {invoices.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-md p-12 text-center">
//           <p className="text-2xl text-gray-400">📭</p>
//           <p className="text-gray-500 mt-4">{arabicMode ? "لا توجد فواتير بعد" : "No invoices yet"}</p>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {invoices.map((inv) => (
//             <div
//               key={inv.id}
//               onClick={() => handleViewDetails(inv)}
//               className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border-l-4 border-blue-500 hover:border-blue-600"
//             >
//               <div className="p-5 flex items-center justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-4 mb-2">
//                     <h3 className="text-lg font-bold text-gray-800">{inv.invoice_number}</h3>
//                     <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
//                       inv.status === "paid" ? "bg-green-100 text-green-800" :
//                       inv.status === "partial" ? "bg-yellow-100 text-yellow-800" :
//                       "bg-red-100 text-red-800"
//                     }`}>
//                       {getStatusIcon(inv.status)} {getStatusLabel(inv.status)}
//                     </span>
//                   </div>
//                   <p className="text-gray-600 mb-3">{arabicMode ? "العميل:" : "Customer:"} <strong>{inv.customer_name}</strong></p>
//                   <div className="flex gap-8 text-sm text-gray-600">
//                     <span>{arabicMode ? "التاريخ:" : "Date:"} {new Date(inv.date).toLocaleDateString()}</span>
//                     <span>{arabicMode ? "الإجمالي:" : "Total:"} <strong className="text-gray-800">${inv.total_amount.toFixed(2)}</strong></span>
//                     <span>{arabicMode ? "المدفوع:" : "Paid:"} <strong className="text-gray-800">${inv.paid_amount.toFixed(2)}</strong></span>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => handleViewDetails(inv)}
//                   className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-bold transition shadow-md hover:shadow-lg"
//                 >
//                   {arabicMode ? "عرض التفاصيل →" : "View Details →"}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Invoice Details Modal */}
//       {selectedInvoice && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
//             {/* Modal Header with Gradient */}
//             <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white p-6 flex justify-between items-center border-b-4 border-blue-700 shadow-lg">
//               <div className="flex-1">
//                 <h2 className="text-3xl font-black mb-1">{arabicMode ? "تفاصيل الفاتورة" : "Invoice Details"}</h2>
//                 <p className="text-blue-100 text-lg">{selectedInvoice.invoice_number} • {selectedInvoice.customer_name}</p>
//               </div>
//               <button
//                 onClick={() => setSelectedInvoice(null)}
//                 className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-bold text-xl transition shadow-md"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Quick Stats Row */}
//             <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-6 border-b flex gap-6 flex-wrap">
//               <div>
//                 <p className="text-xs font-bold text-gray-600 uppercase mb-1">{arabicMode ? "الإجمالي" : "Total Amount"}</p>
//                 <p className="text-2xl font-black text-blue-600">${selectedInvoice.total_amount.toFixed(2)}</p>
//               </div>
//               <div>
//                 <p className="text-xs font-bold text-gray-600 uppercase mb-1">{arabicMode ? "المدفوع" : "Paid"}</p>
//                 <p className="text-2xl font-black text-green-600">${selectedInvoice.paid_amount.toFixed(2)}</p>
//               </div>
//               <div>
//                 <p className="text-xs font-bold text-gray-600 uppercase mb-1">{arabicMode ? "المتبقي" : "Remaining"}</p>
//                 <p className={`text-2xl font-black ${getRemainingBalance(selectedInvoice) > 0 ? "text-orange-600" : "text-green-600"}`}>
//                   ${getRemainingBalance(selectedInvoice).toFixed(2)}
//                 </p>
//               </div>
//               <div className={`px-4 py-2 rounded-lg font-bold text-white ${
//                 selectedInvoice.status === "paid" ? "bg-green-500" :
//                 selectedInvoice.status === "partial" ? "bg-yellow-500" :
//                 "bg-red-500"
//               }`}>
//                 {getStatusLabel(selectedInvoice.status)}
//               </div>
//             </div>

//             {/* Print Area */}
//             <div ref={printRef} className="p-8 bg-white">
//               {/* Professional Invoice Header */}
//               <div className="text-center mb-8 pb-6 border-b-2 border-blue-200">
//                 <h1 className="text-4xl font-black text-blue-600 mb-2">{arabicMode ? "أولاد السمان" : "Awlad Elsaman"}</h1>
//                 <p className="text-gray-600 text-sm">{arabicMode ? "مواد البناء والمواد الإنشائية" : "Building Materials & Construction Supplies"}</p>
//               </div>

//               {/* Invoice Metadata Grid */}
//               <div className="grid grid-cols-2 gap-8 mb-8">
//                 {/* Left Column - Customer Info */}
//                 <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
//                   <h4 className="font-bold text-blue-600 mb-4 text-sm uppercase tracking-wide">{arabicMode ? "معلومات العميل" : "Customer Information"}</h4>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-xs text-gray-600 font-semibold mb-1">{arabicMode ? "اسم العميل" : "Customer Name"}</p>
//                       <p className="text-gray-800 font-bold text-lg">{selectedInvoice.customer_name}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-600 font-semibold mb-1">{arabicMode ? "رقم الفاتورة" : "Invoice Number"}</p>
//                       <p className="text-gray-800 font-bold text-lg font-mono">{selectedInvoice.invoice_number}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column - Invoice Info */}
//                 <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
//                   <h4 className="font-bold text-green-600 mb-4 text-sm uppercase tracking-wide">{arabicMode ? "معلومات الفاتورة" : "Invoice Information"}</h4>
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-xs text-gray-600 font-semibold mb-1">{arabicMode ? "تاريخ الإصدار" : "Issue Date"}</p>
//                       <p className="text-gray-800 font-bold text-lg">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-600 font-semibold mb-1">{arabicMode ? "حالة الفاتورة" : "Invoice Status"}</p>
//                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
//                         selectedInvoice.status === "paid" ? "bg-green-200 text-green-800" :
//                         selectedInvoice.status === "partial" ? "bg-yellow-200 text-yellow-800" :
//                         "bg-red-200 text-red-800"
//                       }`}>
//                         {getStatusLabel(selectedInvoice.status)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Items Table */}
//               <div className="mb-8">
//                 <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide bg-gradient-to-r from-gray-100 to-gray-50 p-3 rounded border-l-4 border-blue-500">
//                   {arabicMode ? "📦 عناصر الفاتورة" : "📦 Invoice Items"}
//                 </h4>
//                 <div className="overflow-x-auto">
//                   <table className="w-full border-collapse">
//                     <thead>
//                       <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
//                         <th className="p-3 text-left text-sm font-bold">#</th>
//                         <th className="p-3 text-left text-sm font-bold">{arabicMode ? "المنتج" : "Product"}</th>
//                         <th className="p-3 text-center text-sm font-bold">{arabicMode ? "الكمية" : "Qty"}</th>
//                         <th className="p-3 text-right text-sm font-bold">{arabicMode ? "السعر" : "Price"}</th>
//                         <th className="p-3 text-right text-sm font-bold">{arabicMode ? "الإجمالي" : "Total"}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {invoiceItems.map((item, idx) => (
//                         <tr key={item.id} className="border-b border-gray-200 hover:bg-blue-50 transition">
//                           <td className="p-3 text-sm font-medium text-gray-600">{idx + 1}</td>
//                           <td className="p-3 text-sm font-semibold text-gray-800">{item.product_name || item.name}</td>
//                           <td className="p-3 text-center text-sm text-gray-700 font-bold">{item.quantity}</td>
//                           <td className="p-3 text-right text-sm text-gray-700">${item.unit_price.toFixed(2)}</td>
//                           <td className="p-3 text-right text-sm font-bold text-blue-600">${calculateLineTotal(item).toFixed(2)}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* Totals Summary Card */}
//               <div className="flex justify-end mb-8">
//                 <div className="w-full max-w-sm">
//                   <div className="bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200 rounded-lg overflow-hidden shadow-lg">
//                     {/* Subtotal */}
//                     <div className="flex justify-between p-4 border-b border-blue-100">
//                       <span className="text-gray-700 font-semibold">{arabicMode ? "المجموع الجزئي" : "Subtotal"}</span>
//                       <span className="text-gray-800 font-bold">${selectedInvoice.subtotal.toFixed(2)}</span>
//                     </div>

//                     {/* Tax */}
//                     <div className="flex justify-between p-4 border-b border-blue-100">
//                       <span className="text-gray-700 font-semibold">{arabicMode ? "الضريبة (VAT)" : "Tax (VAT)"}</span>
//                       <span className="text-gray-800 font-bold">${selectedInvoice.tax_amount.toFixed(2)}</span>
//                     </div>

//                     {/* Grand Total */}
//                     <div className="flex justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white border-b-2 border-blue-700">
//                       <span className="font-black text-lg">{arabicMode ? "الإجمالي" : "Total"}</span>
//                       <span className="font-black text-lg">${selectedInvoice.total_amount.toFixed(2)}</span>
//                     </div>

//                     {/* Paid */}
//                     <div className="flex justify-between p-4 border-b border-blue-100">
//                       <span className="text-gray-700 font-semibold">{arabicMode ? "المبلغ المدفوع" : "Amount Paid"}</span>
//                       <span className="text-green-600 font-bold">${selectedInvoice.paid_amount.toFixed(2)}</span>
//                     </div>

//                     {/* Balance */}
//                     <div className={`flex justify-between p-4 rounded-b-lg font-bold ${
//                       getRemainingBalance(selectedInvoice) > 0
//                         ? "bg-orange-100 text-orange-800"
//                         : "bg-green-100 text-green-800"
//                     }`}>
//                       <span>{arabicMode ? "الرصيد المتبقي" : "Balance Due"}</span>
//                       <span>${getRemainingBalance(selectedInvoice).toFixed(2)}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="text-center pt-6 border-t-2 border-gray-300 text-gray-600">
//                 <p className="text-sm font-semibold">{arabicMode ? "شكراً لتعاملكم معنا! نتطلع لخدمتكم مجدداً" : "Thank you for your business! We look forward to serving you again."}</p>
//               </div>
//             </div>

//             {/* Modal Footer with Actions */}
//             <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-6 border-t-2 border-gray-200 flex justify-end gap-4 sticky bottom-0">
//               <button
//                 onClick={() => setSelectedInvoice(null)}
//                 className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition shadow-md hover:shadow-lg"
//               >
//                 {arabicMode ? "✕ إغلاق" : "✕ Close"}
//               </button>
//               <button
//                 onClick={handlePrint}
//                 className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition shadow-md hover:shadow-lg"
//               >
//                 🖨️ {arabicMode ? "طباعة الفاتورة" : "Print Invoice"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useMemo, useState, useRef } from "react";
import { api } from "../api";
import { invoiceLogic } from "../services/invoiceLogic";
import type { Invoice, InvoiceItem } from "../types";

export function InvoicesPage({ arabicMode }: { arabicMode: boolean }) {
  const invoices = useMemo(() => invoiceLogic.getAll(), []);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setLoadingItems(true);
    try {
      const items = api.getInvoiceItems(invoice.id);
      setInvoiceItems(items || []);
      console.log("Loaded invoice items:", items); // Debug log
    } catch (error) {
      console.error("Error loading invoice items:", error);
      setInvoiceItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printWindow = window.open("", "", "width=900,height=700");
    if (!printWindow) {
      alert(arabicMode ? "يرجى السماح بفتح النوافذ المنبثقة" : "Please allow pop-ups");
      return;
    }

    const printContent = printRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${arabicMode ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="UTF-8">
          <title>Invoice ${selectedInvoice?.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; background: white; }
            .print-container { max-width: 900px; margin: 0 auto; }
            .invoice-header { text-align: center; border-bottom: 2px solid #2c3e50; padding-bottom: 20px; margin-bottom: 25px; }
            .company-name { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
            .invoice-title { font-size: 18px; font-weight: bold; margin-top: 10px; color: #b8860b; }
            .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 25px; margin-top: 20px; flex-wrap: wrap; gap: 20px; }
            .meta-block { flex: 1; min-width: 200px; }
            .meta-block h4 { font-size: 12px; font-weight: bold; color: #b8860b; margin-bottom: 8px; text-transform: uppercase; }
            .meta-block p { font-size: 14px; color: #2c3e50; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            th { background: #2c3e50; color: white; padding: 10px; text-align: left; font-size: 13px; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            .totals-section { display: flex; justify-content: flex-end; margin-bottom: 25px; }
            .totals-box { width: 300px; border: 1px solid #e5e7eb; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #e5e7eb; }
            .total-row.grand-total { background: #2c3e50; color: white; font-weight: bold; }
            .footer { text-align: center; font-size: 12px; color: #666; padding-top: 20px; border-top: 1px solid #e5e7eb; margin-top: 25px; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent}
          </div>
          <script>
            window.print();
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: { ar: string; en: string } } = {
      unpaid: { ar: "غير مدفوعة", en: "Unpaid" },
      partial: { ar: "مدفوعة جزئياً", en: "Partial" },
      paid: { ar: "مدفوعة", en: "Paid" },
    };
    return arabicMode ? statusMap[status]?.ar : statusMap[status]?.en;
  };

  const getRemainingBalance = (invoice: Invoice) => {
    return Math.max(0, invoice.total_amount - invoice.paid_amount);
  };

  const calculateLineTotal = (item: InvoiceItem) => {
    return item.quantity * item.unit_price;
  };

  // Stats
  const totalInvoices = invoices.length;
  const paidCount = invoices.filter(i => i.status === "paid").length;
  const partialCount = invoices.filter(i => i.status === "partial").length;
  const unpaidCount = invoices.filter(i => i.status === "unpaid").length;
  const totalRevenue = invoices.reduce((sum, i) => sum + i.total_amount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paid_amount, 0);
  const totalDue = totalRevenue - totalPaid;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* STATS CARDS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>{totalInvoices}</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>{arabicMode ? "إجمالي الفواتير" : "Total Invoices"}</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>${totalRevenue.toFixed(2)}</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>{arabicMode ? "إجمالي المبيعات" : "Total Sales"}</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>${totalPaid.toFixed(2)}</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>{arabicMode ? "المدفوع" : "Total Paid"}</div>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>${totalDue.toFixed(2)}</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>{arabicMode ? "المتبقي" : "Total Due"}</div>
        </div>
      </div>

      {/* INVOICES LIST SECTION */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>{arabicMode ? "قائمة الفواتير" : "Invoices List"}</h3>
          <div className="chips" style={{ gap: '0.5rem' }}>
            <span className="chip status paid" style={{ background: '#d1fae5', color: '#065f46' }}>
              {arabicMode ? "مدفوعة" : "Paid"}: {paidCount}
            </span>
            <span className="chip status partial" style={{ background: '#fef3c7', color: '#92400e' }}>
              {arabicMode ? "مدفوعة جزئياً" : "Partial"}: {partialCount}
            </span>
            <span className="chip status unpaid" style={{ background: '#fee2e2', color: '#991b1b' }}>
              {arabicMode ? "غير مدفوعة" : "Unpaid"}: {unpaidCount}
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }} className="table-card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: arabicMode ? 'right' : 'left' }}>#</th>
                <th style={{ textAlign: arabicMode ? 'right' : 'left' }}>{arabicMode ? "العميل" : "Customer"}</th>
                <th style={{ textAlign: 'center' }}>{arabicMode ? "التاريخ" : "Date"}</th>
                <th style={{ textAlign: 'right' }}>{arabicMode ? "الإجمالي" : "Total"}</th>
                <th style={{ textAlign: 'right' }}>{arabicMode ? "المدفوع" : "Paid"}</th>
                <th style={{ textAlign: 'right' }}>{arabicMode ? "المتبقي" : "Due"}</th>
                <th style={{ textAlign: 'center' }}>{arabicMode ? "الحالة" : "Status"}</th>
                <th style={{ textAlign: arabicMode ? 'left' : 'right' }}>{arabicMode ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const due = getRemainingBalance(inv);
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ fontWeight: '500' }}>{inv.invoice_number}</td>
                    <td>{inv.customer_name}</td>
                    <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>{new Date(inv.date).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: '500' }}>${inv.total_amount.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>${inv.paid_amount.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', color: due > 0 ? '#dc2626' : '#059669', fontWeight: due > 0 ? 'bold' : 'normal' }}>
                      ${due.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status ${inv.status}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        {getStatusLabel(inv.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => handleViewDetails(inv)}
                        style={{ 
                          padding: '0.4rem 0.8rem', 
                          fontSize: '0.8rem',
                          background: '#e5e7eb',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        {arabicMode ? "عرض التفاصيل" : "View Details"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              {arabicMode ? "لا توجد فواتير بعد" : "No invoices yet"}
            </div>
          )}
        </div>
      </section>

      {/* INVOICE DETAILS MODAL */}
      {selectedInvoice && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 0,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f9fafb',
              borderRadius: '16px 16px 0 0'
            }}>
              <div>
                <h3 style={{ margin: 0 }}>{arabicMode ? "تفاصيل الفاتورة" : "Invoice Details"}</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#666' }}>
                  {selectedInvoice.invoice_number} • {selectedInvoice.customer_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '8px'
                }}
              >
                ×
              </button>
            </div>

            {/* Quick Info Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              padding: '1rem 1.5rem',
              background: '#fefce8',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>{arabicMode ? "الإجمالي" : "Total"}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2c3e50' }}>${selectedInvoice.total_amount.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>{arabicMode ? "المدفوع" : "Paid"}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669' }}>${selectedInvoice.paid_amount.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>{arabicMode ? "المتبقي" : "Due"}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: getRemainingBalance(selectedInvoice) > 0 ? '#dc2626' : '#059669' }}>
                  ${getRemainingBalance(selectedInvoice).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>{arabicMode ? "الحالة" : "Status"}</div>
                <span className={`status ${selectedInvoice.status}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                  {getStatusLabel(selectedInvoice.status)}
                </span>
              </div>
            </div>

            {/* Printable Content */}
            <div ref={printRef} style={{ padding: '1.5rem' }}>
              {/* Company Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #2c3e50' }}>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>{arabicMode ? "أولاد السمان" : "Awlad Elsaman"}</h2>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#666' }}>
                  {arabicMode ? "مواد البناء والمواد الإنشائية" : "Building Materials & Construction Supplies"}
                </p>
              </div>

              {/* Invoice Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', color: '#b8860b', textTransform: 'uppercase' }}>
                    {arabicMode ? "معلومات العميل" : "Customer Information"}
                  </h4>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedInvoice.customer_name}</p>
                </div>
                <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', color: '#b8860b', textTransform: 'uppercase' }}>
                    {arabicMode ? "معلومات الفاتورة" : "Invoice Information"}
                  </h4>
                  <p style={{ margin: 0 }}>{arabicMode ? "التاريخ" : "Date"}: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  <p style={{ margin: 0 }}>{arabicMode ? "رقم الفاتورة" : "Invoice No"}: {selectedInvoice.invoice_number}</p>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ background: '#2c3e50', color: 'white' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>{arabicMode ? "المنتج" : "Product"}</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>{arabicMode ? "الكمية" : "Qty"}</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>{arabicMode ? "السعر" : "Price"}</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>{arabicMode ? "الإجمالي" : "Total"}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingItems ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                        {arabicMode ? "جاري تحميل المنتجات..." : "Loading products..."}
                      </td>
                    </tr>
                  ) : invoiceItems.length > 0 ? (
                    invoiceItems.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.5rem' }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem', fontWeight: '500' }}>{item.product_name || item.name}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>${item.unit_price.toFixed(2)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>${calculateLineTotal(item).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                        {arabicMode ? "لا توجد منتجات في هذه الفاتورة" : "No products in this invoice"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '280px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                    <span>{arabicMode ? "المجموع الفرعي" : "Subtotal"}</span>
                    <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                    <span>{arabicMode ? "الضريبة" : "Tax"}</span>
                    <span>${selectedInvoice.tax_amount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#2c3e50', color: 'white', fontWeight: 'bold' }}>
                    <span>{arabicMode ? "الإجمالي" : "Total"}</span>
                    <span>${selectedInvoice.total_amount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                    <span>{arabicMode ? "المدفوع" : "Paid"}</span>
                    <span style={{ color: '#059669' }}>${selectedInvoice.paid_amount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: getRemainingBalance(selectedInvoice) > 0 ? '#fef3c7' : '#d1fae5' }}>
                    <span style={{ fontWeight: 'bold' }}>{arabicMode ? "المتبقي" : "Balance Due"}</span>
                    <span style={{ fontWeight: 'bold', color: getRemainingBalance(selectedInvoice) > 0 ? '#dc2626' : '#059669' }}>
                      ${getRemainingBalance(selectedInvoice).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '0.7rem', color: '#666' }}>
                {arabicMode ? "شكراً لتعاملكم معنا" : "Thank you for your business"}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              background: '#f9fafb',
              borderRadius: '0 0 16px 16px'
            }}>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem' }}
              >
                {arabicMode ? "إغلاق" : "Close"}
              </button>
              <button
                onClick={handlePrint}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                🖨️ {arabicMode ? "طباعة" : "Print"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { api } from '../api';
// import type { Supplier, PurchaseOrder, SupplierPayment } from '../types';

// export default function SupplierPaymentsPage() {
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [orders, setOrders] = useState<PurchaseOrder[]>([]);
//   const [payments, setPayments] = useState<SupplierPayment[]>([]);
//   const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
//   const [selectedPO, setSelectedPO] = useState<number | null>(null);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState<Partial<SupplierPayment>>({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string>('');
//   const [success, setSuccess] = useState<string>('');

//   useEffect(() => {
//     loadSuppliers();
//     loadOrders();
//   }, []);

//   useEffect(() => {
//     if (selectedSupplier) {
//       loadSupplierPayments();
//     }
//   }, [selectedSupplier]);

//   const loadSuppliers = async () => {
//     try {
//       const data = api.suppliers.list();
//       setSuppliers(data);
//     } catch (err) {
//       setError('Failed to load suppliers');
//       console.error(err);
//     }
//   };

//   const loadOrders = async () => {
//     try {
//       const data = api.purchaseOrders.list();
//       setOrders(data);
//     } catch (err) {
//       console.error('Failed to load orders:', err);
//     }
//   };

//   const loadSupplierPayments = async () => {
//     if (!selectedSupplier) return;
//     try {
//       const data = api.supplierPayments.bySupplier(selectedSupplier);
//       setPayments(data);
//     } catch (err) {
//       console.error('Failed to load payments:', err);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedPO || !formData.amount_paid) {
//       setError('Please fill all required fields');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const result = api.supplierPayments.create({
//         purchase_order_id: selectedPO,
//         supplier_id: selectedSupplier!,
//         amount_paid: formData.amount_paid,
//         payment_method: formData.payment_method || 'cash',
//         reference_number: formData.reference_number,
//         notes: formData.notes,
//       });

//       if (result.ok) {
//         setSuccess('Payment recorded successfully!');
//         loadSupplierPayments();
//         setFormData({});
//         setShowForm(false);
//         setSelectedPO(null);
//       } else {
//         setError(result.error || 'Failed to record payment');
//       }
//     } catch (err) {
//       setError('Error recording payment');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getSupplierOrders = () => {
//     return orders.filter(o => o.supplier_id === selectedSupplier && o.status !== 'cancelled');
//   };

//   const selectedPOData = orders.find(o => o.id === selectedPO);
//   const totalPayments = payments.reduce((sum, p) => sum + p.amount_paid, 0);

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold mb-2">💳 Supplier Payments</h1>
//         <p className="text-gray-600">Record and track supplier payments</p>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {success && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           {success}
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* Suppliers List */}
//         <div className="lg:col-span-1">
//           <h2 className="font-bold text-lg mb-4 bg-blue-50 p-3 rounded">🏢 Suppliers</h2>
//           <div className="space-y-2 max-h-96 overflow-y-auto">
//             {suppliers.length === 0 ? (
//               <p className="text-gray-500 text-sm">No suppliers</p>
//             ) : (
//               suppliers.map((supplier) => (
//                 <button
//                   key={supplier.id}
//                   onClick={() => {
//                     setSelectedSupplier(supplier.id);
//                     setSelectedPO(null);
//                   }}
//                   className={`w-full p-3 text-left rounded border transition ${
//                     selectedSupplier === supplier.id
//                       ? 'bg-blue-100 border-blue-500 shadow'
//                       : 'bg-white border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <div className="font-medium text-sm">{supplier.name}</div>
//                   <div className="text-xs text-gray-600">{supplier.contact_person}</div>
//                 </button>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="lg:col-span-3">
//           {selectedSupplier ? (
//             <div>
//               {/* Payment Form */}
//               {!showForm && (
//                 <button
//                   onClick={() => setShowForm(true)}
//                   className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-bold"
//                 >
//                   + Record Payment
//                 </button>
//               )}

//               {showForm && (
//                 <form onSubmit={handleSubmit} className="bg-white p-6 rounded border shadow mb-6">
//                   <h3 className="font-bold text-lg mb-4">Record New Payment</h3>

//                   <div className="grid grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Purchase Order *</label>
//                       <select
//                         required
//                         value={selectedPO || ''}
//                         onChange={(e) => setSelectedPO(parseInt(e.target.value))}
//                         className="w-full p-2 border rounded"
//                       >
//                         <option value="">Select PO</option>
//                         {getSupplierOrders().map((order) => (
//                           <option key={order.id} value={order.id}>
//                             {order.po_number} - ${order.total_amount}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {selectedPOData && (
//                       <div>
//                         <label className="block text-sm font-medium mb-1">PO Amount</label>
//                         <input
//                           type="text"
//                           disabled
//                           value={`$${selectedPOData.total_amount}`}
//                           className="w-full p-2 border rounded bg-gray-50"
//                         />
//                       </div>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Amount Paid *</label>
//                       <input
//                         type="number"
//                         step="0.01"
//                         required
//                         value={formData.amount_paid || ''}
//                         onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) })}
//                         className="w-full p-2 border rounded"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">Payment Method</label>
//                       <select
//                         value={formData.payment_method || 'cash'}
//                         onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
//                         className="w-full p-2 border rounded"
//                       >
//                         <option value="cash">Cash</option>
//                         <option value="check">Check</option>
//                         <option value="bank_transfer">Bank Transfer</option>
//                         <option value="credit">Credit</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">Reference Number</label>
//                     <input
//                       type="text"
//                       value={formData.reference_number || ''}
//                       onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
//                       className="w-full p-2 border rounded mb-4"
//                       placeholder="Check number, transfer ID, etc."
//                     />
//                   </div>

//                   <div className="mb-4">
//                     <label className="block text-sm font-medium mb-1">Notes</label>
//                     <textarea
//                       value={formData.notes || ''}
//                       onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                       className="w-full p-2 border rounded"
//                       rows={2}
//                     />
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       type="submit"
//                       disabled={loading}
//                       className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 font-bold"
//                     >
//                       {loading ? 'Recording...' : '✓ Record Payment'}
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowForm(false);
//                         setFormData({});
//                         setSelectedPO(null);
//                       }}
//                       className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </form>
//               )}

//               {/* Payments Summary */}
//               <div className="bg-white p-4 rounded border shadow mb-6">
//                 <h3 className="font-bold text-lg mb-3">💰 Payments Summary</h3>
//                 <div className="grid grid-cols-3 gap-4 text-center">
//                   <div className="bg-blue-50 p-3 rounded">
//                     <div className="text-2xl font-bold text-blue-600">{payments.length}</div>
//                     <div className="text-sm text-gray-600">Payments</div>
//                   </div>
//                   <div className="bg-green-50 p-3 rounded">
//                     <div className="text-2xl font-bold text-green-600">${totalPayments.toFixed(2)}</div>
//                     <div className="text-sm text-gray-600">Total Paid</div>
//                   </div>
//                   <div className="bg-orange-50 p-3 rounded">
//                     <div className="text-2xl font-bold text-orange-600">
//                       ${(getSupplierOrders().reduce((sum, o) => sum + o.total_amount, 0) - totalPayments).toFixed(2)}
//                     </div>
//                     <div className="text-sm text-gray-600">Remaining Balance</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Payments List */}
//               <div>
//                 <h3 className="font-bold text-lg mb-3">📋 Payment History</h3>
//                 {payments.length === 0 ? (
//                   <p className="text-gray-500 text-center py-8">No payments recorded yet</p>
//                 ) : (
//                   <div className="space-y-2">
//                     {payments.map((payment) => (
//                       <div key={payment.id} className="bg-white p-4 rounded border hover:shadow-lg transition">
//                         <div className="flex justify-between items-start mb-2">
//                           <div>
//                             <div className="font-bold">{payment.po_number}</div>
//                             <div className="text-sm text-gray-600">{payment.payment_date}</div>
//                           </div>
//                           <div className="text-right">
//                             <div className="font-bold text-lg text-green-600">${payment.amount_paid.toFixed(2)}</div>
//                             <div className="text-xs text-gray-500">{payment.payment_method}</div>
//                           </div>
//                         </div>
//                         {payment.reference_number && (
//                           <p className="text-sm text-gray-600">Ref: {payment.reference_number}</p>
//                         )}
//                         {payment.notes && (
//                           <p className="text-sm text-gray-500">{payment.notes}</p>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <p className="text-gray-500 text-center py-12">Select a supplier to view and record payments</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Supplier, PurchaseOrder, SupplierPayment } from '../types';

export default function SupplierPaymentsPage({ arabicMode }: { arabicMode: boolean }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [selectedPO, setSelectedPO] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SupplierPayment>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadSuppliers();
    loadOrders();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      loadSupplierPayments();
    }
  }, [selectedSupplier]);

  const loadSuppliers = async () => {
    try {
      const data = api.suppliers.list();
      setSuppliers(data);
    } catch (err) {
      setError(arabicMode ? 'فشل تحميل الموردين' : 'Failed to load suppliers');
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = api.purchaseOrders.list();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const loadSupplierPayments = async () => {
    if (!selectedSupplier) return;
    try {
      const data = api.supplierPayments.bySupplier(selectedSupplier);
      setPayments(data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO || !formData.amount_paid) {
      setError(arabicMode ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = api.supplierPayments.create({
        purchase_order_id: selectedPO,
        supplier_id: selectedSupplier!,
        amount_paid: formData.amount_paid,
        payment_method: formData.payment_method || 'cash',
        reference_number: formData.reference_number,
        notes: formData.notes,
      });

      if (result.ok) {
        setSuccess(arabicMode ? 'تم تسجيل الدفع بنجاح!' : 'Payment recorded successfully!');
        loadSupplierPayments();
        setFormData({});
        setShowForm(false);
        setSelectedPO(null);
      } else {
        setError(result.error || (arabicMode ? 'فشل تسجيل الدفع' : 'Failed to record payment'));
      }
    } catch (err) {
      setError(arabicMode ? 'خطأ في تسجيل الدفع' : 'Error recording payment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSupplierOrders = () => {
    return orders.filter(o => o.supplier_id === selectedSupplier && o.status !== 'cancelled');
  };

  const selectedPOData = orders.find(o => o.id === selectedPO);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount_paid, 0);

  const t = (ar: string, en: string) => arabicMode ? ar : en;

  const paymentMethodOptions = [
    { value: 'cash', ar: 'نقدي', en: 'Cash' },
    { value: 'check', ar: 'شيك', en: 'Check' },
    { value: 'bank_transfer', ar: 'تحويل بنكي', en: 'Bank Transfer' },
    { value: 'credit', ar: 'ائتمان', en: 'Credit' },
  ];

  return (
    <div className="products-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          💳 {t('مدفوعات الموردين', 'Supplier Payments')}
        </h1>
        <p style={{ color: '#666' }}>
          {t('تسجيل وتتبع مدفوعات الموردين', 'Record and track supplier payments')}
        </p>
      </div>

      {error && (
        <div className="error-text" style={{ padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '12px', marginBottom: '0' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="ok-text" style={{ padding: '0.75rem', backgroundColor: '#d1fae5', borderRadius: '12px', marginBottom: '0' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Suppliers List */}
        <section className="card">
          <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
              🏢 {t('الموردين', 'Suppliers')}
            </h3>
          </div>
          
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {suppliers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                {t('لا يوجد موردين', 'No suppliers')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {suppliers.map((supplier) => (
                  <button
                    key={supplier.id}
                    onClick={() => {
                      setSelectedSupplier(supplier.id);
                      setSelectedPO(null);
                      setShowForm(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: `1px solid ${selectedSupplier === supplier.id ? 'var(--brand-accent)' : '#e5ddcf'}`,
                      background: selectedSupplier === supplier.id ? 'rgba(184, 134, 11, 0.06)' : '#fff',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{supplier.name}</div>
                    {supplier.contact_person && (
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>{supplier.contact_person}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <section className="card" style={{ gridColumn: 'span 2' }}>
          {selectedSupplier ? (
            <div>
              {/* Payment Form */}
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-accent"
                  style={{ marginBottom: '1rem', fontWeight: 'bold' }}
                >
                  + {t('تسجيل دفعة', 'Record Payment')}
                </button>
              )}

              {showForm && (
                <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                    {t('تسجيل دفعة جديدة', 'Record New Payment')}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                        {t('أمر الشراء *', 'Purchase Order *')}
                      </label>
                      <select
                        required
                        className="select-input"
                        value={selectedPO || ''}
                        onChange={(e) => setSelectedPO(parseInt(e.target.value))}
                      >
                        <option value="">{t('اختر أمر شراء', 'Select PO')}</option>
                        {getSupplierOrders().map((order) => (
                          <option key={order.id} value={order.id}>
                            {order.po_number} - ${order.total_amount}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedPOData && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                          {t('قيمة أمر الشراء', 'PO Amount')}
                        </label>
                        <input
                          type="text"
                          disabled
                          value={`$${selectedPOData.total_amount}`}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5ddcf', borderRadius: '8px', backgroundColor: '#f9f5f0' }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                        {t('المبلغ المدفوع *', 'Amount Paid *')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount_paid || ''}
                        onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5ddcf', borderRadius: '8px' }}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                        {t('طريقة الدفع', 'Payment Method')}
                      </label>
                      <select
                        className="select-input"
                        value={formData.payment_method || 'cash'}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                      >
                        {paymentMethodOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {arabicMode ? option.ar : option.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      {t('رقم المرجع', 'Reference Number')}
                    </label>
                    <input
                      type="text"
                      value={formData.reference_number || ''}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5ddcf', borderRadius: '8px' }}
                      placeholder={t('رقم الشيك، معرف التحويل، إلخ.', 'Check number, transfer ID, etc.')}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                      {t('ملاحظات', 'Notes')}
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #e5ddcf', borderRadius: '12px', fontFamily: 'inherit' }}
                      placeholder={t('ملاحظات إضافية', 'Additional notes')}
                    />
                  </div>

                  <div className="chips" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({});
                        setSelectedPO(null);
                      }}
                      className="chip danger-chip"
                    >
                      {t('إلغاء', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                      style={{ fontWeight: 'bold' }}
                    >
                      {loading ? (t('جاري التسجيل...', 'Recording...')) : (t('✓ تسجيل الدفع', '✓ Record Payment'))}
                    </button>
                  </div>
                </form>
              )}

              {/* Payments Summary */}
              <div style={{ backgroundColor: '#f9f5f0', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                  💰 {t('ملخص المدفوعات', 'Payments Summary')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
                  <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand-primary)' }}>{payments.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('عدد المدفوعات', 'Payments')}</div>
                  </div>
                  <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>${totalPayments.toFixed(2)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('إجمالي المدفوع', 'Total Paid')}</div>
                  </div>
                  <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand-accent)' }}>
                      ${(getSupplierOrders().reduce((sum, o) => sum + o.total_amount, 0) - totalPayments).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('الرصيد المتبقي', 'Remaining Balance')}</div>
                  </div>
                </div>
              </div>

              {/* Payments List */}
              <div>
                <div style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>
                    📋 {t('سجل المدفوعات', 'Payment History')}
                  </h3>
                </div>
                {payments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    {t('لا توجد مدفوعات مسجلة', 'No payments recorded yet')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {payments.map((payment) => (
                      <div key={payment.id} className="card" style={{ padding: '0.75rem', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{payment.po_number}</div>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>{payment.payment_date}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#166534' }}>${payment.amount_paid.toFixed(2)}</div>
                            <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'capitalize' }}>
                              {paymentMethodOptions.find(o => o.value === payment.payment_method)?.[arabicMode ? 'ar' : 'en'] || payment.payment_method}
                            </div>
                          </div>
                        </div>
                        {payment.reference_number && (
                          <div style={{ fontSize: '0.7rem', color: '#666' }}>
                            {t('مرجع', 'Ref')}: {payment.reference_number}
                          </div>
                        )}
                        {payment.notes && (
                          <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.25rem' }}>{payment.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              {t('اختر مورداً لعرض وتسجيل المدفوعات', 'Select a supplier to view and record payments')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
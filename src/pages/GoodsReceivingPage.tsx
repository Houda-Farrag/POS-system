// import React, { useState, useEffect } from 'react';
// import { api } from '../api';
// import type { PurchaseOrder, PurchaseItem, GoodsReceived } from '../types';

// export default function GoodsReceivingPage() {
//   const [orders, setOrders] = useState<PurchaseOrder[]>([]);
//   const [selectedPO, setSelectedPO] = useState<number | null>(null);
//   const [poItems, setPoItems] = useState<PurchaseItem[]>([]);
//   const [receivedItems, setReceivedItems] = useState<GoodsReceived[]>([]);
//   const [formData, setFormData] = useState<{
//     items: Array<{ product_id: number; quantity_received: number }>;
//     total_items: number;
//     damaged_items: number;
//     notes: string;
//   }>({
//     items: [],
//     total_items: 0,
//     damaged_items: 0,
//     notes: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string>('');
//   const [success, setSuccess] = useState<string>('');

//   useEffect(() => {
//     loadOrders();
//   }, []);

//   useEffect(() => {
//     if (selectedPO) {
//       loadPOItems();
//       loadReceivedItems();
//     }
//   }, [selectedPO]);

//   const loadOrders = async () => {
//     try {
//       const allOrders = api.purchaseOrders.list();
//       // Filter to only show submitted or partially received orders
//       const receivableOrders = allOrders.filter(o => o.status !== 'received' && o.status !== 'cancelled');
//       setOrders(receivableOrders);
//       setError('');
//     } catch (err) {
//       setError('Failed to load purchase orders');
//       console.error(err);
//     }
//   };

//   const loadPOItems = async () => {
//     try {
//       if (selectedPO) {
//         const items = api.purchaseItems.list(selectedPO);
//         setPoItems(items);
//         // Initialize received quantities
//         setFormData({
//           items: items.map(item => ({ product_id: item.product_id, quantity_received: 0 })),
//           total_items: 0,
//           damaged_items: 0,
//           notes: '',
//         });
//       }
//     } catch (err) {
//       console.error('Failed to load PO items:', err);
//     }
//   };

//   const loadReceivedItems = async () => {
//     try {
//       if (selectedPO) {
//         const received = api.goodsReceived.list(selectedPO);
//         setReceivedItems(received);
//       }
//     } catch (err) {
//       console.error('Failed to load received items:', err);
//     }
//   };

//   const handleQuantityChange = (itemId: number, qty: number) => {
//     setFormData({
//       ...formData,
//       items: formData.items.map(item =>
//         item.product_id === itemId ? { ...item, quantity_received: qty } : item
//       ),
//     });
//   };

//   const handleReceiveGoods = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedPO) return;

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const result = api.goodsReceived.create({
//         purchase_order_id: selectedPO,
//         total_items: formData.total_items,
//         damaged_items: formData.damaged_items,
//         items: formData.items.filter(item => item.quantity_received > 0),
//         notes: formData.notes,
//       });

//       if (result.ok) {
//         setSuccess('Goods received successfully! Stock updated.');
//         loadPOItems();
//         loadReceivedItems();
//         loadOrders();
//         setFormData({
//           items: [],
//           total_items: 0,
//           damaged_items: 0,
//           notes: '',
//         });
//       } else {
//         setError(result.error || 'Failed to receive goods');
//       }
//     } catch (err) {
//       setError('Error receiving goods');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const totalQuantities = formData.items.reduce((sum, item) => sum + item.quantity_received, 0);

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold mb-2">📥 Goods Receiving</h1>
//         <p className="text-gray-600">Receive goods from purchase orders and update stock</p>
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
//         {/* PO List */}
//         <div className="lg:col-span-1">
//           <h2 className="font-bold text-lg mb-4 bg-blue-50 p-3 rounded">📋 Purchase Orders</h2>
//           <div className="space-y-2 max-h-96 overflow-y-auto">
//             {orders.length === 0 ? (
//               <p className="text-gray-500 text-sm">No orders to receive</p>
//             ) : (
//               orders.map((order) => (
//                 <button
//                   key={order.id}
//                   onClick={() => setSelectedPO(order.id)}
//                   className={`w-full p-3 text-left rounded border transition ${
//                     selectedPO === order.id
//                       ? 'bg-blue-100 border-blue-500 shadow'
//                       : 'bg-white border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <div className="font-medium text-sm">{order.po_number}</div>
//                   <div className="text-xs text-gray-600">{order.supplier_name}</div>
//                   <div className="text-xs text-gray-500">Status: {order.status}</div>
//                 </button>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Items & Receiving Form */}
//         <div className="lg:col-span-3">
//           {selectedPO ? (
//             <div>
//               <h2 className="font-bold text-lg mb-4 bg-blue-50 p-3 rounded">📦 Items to Receive</h2>

//               <form onSubmit={handleReceiveGoods} className="bg-white p-4 rounded border shadow space-y-4">
//                 {/* Items Table */}
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="bg-gray-100 border-b">
//                         <th className="text-left p-2">Product</th>
//                         <th className="text-right p-2">Ordered</th>
//                         <th className="text-right p-2">Receive Qty</th>
//                         <th className="text-right p-2">Unit Price</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {poItems.map((item) => (
//                         <tr key={item.id} className="border-b hover:bg-gray-50">
//                           <td className="p-2">{item.product_name}</td>
//                           <td className="text-right p-2">{item.quantity_ordered}</td>
//                           <td className="text-right p-2">
//                             <input
//                               type="number"
//                               min="0"
//                               max={item.quantity_ordered}
//                               value={formData.items.find(i => i.product_id === item.product_id)?.quantity_received || 0}
//                               onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value))}
//                               className="w-20 p-1 border rounded text-right"
//                             />
//                           </td>
//                           <td className="text-right p-2">${item.unit_price}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Summary */}
//                 <div className="bg-gray-50 p-3 rounded border">
//                   <div className="flex justify-between text-sm mb-2">
//                     <span>Total Items Ordered:</span>
//                     <span className="font-bold">{poItems.reduce((sum, i) => sum + i.quantity_ordered, 0)}</span>
//                   </div>
//                   <div className="flex justify-between text-sm mb-3">
//                     <span>Total Items to Receive:</span>
//                     <span className="font-bold text-blue-600">{totalQuantities}</span>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Total Items *</label>
//                       <input
//                         type="number"
//                         required
//                         min="0"
//                         value={formData.total_items}
//                         onChange={(e) => setFormData({ ...formData, total_items: parseInt(e.target.value) })}
//                         className="w-full p-2 border rounded"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Damaged Items</label>
//                       <input
//                         type="number"
//                         min="0"
//                         value={formData.damaged_items}
//                         onChange={(e) => setFormData({ ...formData, damaged_items: parseInt(e.target.value) })}
//                         className="w-full p-2 border rounded"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">Notes</label>
//                   <textarea
//                     value={formData.notes}
//                     onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                     className="w-full p-2 border rounded"
//                     rows={2}
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading || totalQuantities === 0}
//                   className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 font-bold"
//                 >
//                   {loading ? 'Processing...' : '✓ Receive Goods & Update Stock'}
//                 </button>
//               </form>

//               {/* Previous Receipts */}
//               {receivedItems.length > 0 && (
//                 <div className="mt-6">
//                   <h3 className="font-bold text-lg mb-3">📋 Previous Receipts</h3>
//                   <div className="space-y-2">
//                     {receivedItems.map((receipt) => (
//                       <div key={receipt.id} className="bg-gray-50 p-3 rounded border text-sm">
//                         <div className="flex justify-between">
//                           <span>{receipt.received_date}</span>
//                           <span className="font-bold">{receipt.total_items} items</span>
//                           {receipt.damaged_items > 0 && (
//                             <span className="text-red-600">{receipt.damaged_items} damaged</span>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <p className="text-gray-500 text-center py-12">Select a purchase order to receive goods</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { PurchaseOrder, PurchaseItem, GoodsReceived } from '../types';

export default function GoodsReceivingPage({ arabicMode }: { arabicMode: boolean }) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<number | null>(null);
  const [poItems, setPoItems] = useState<PurchaseItem[]>([]);
  const [receivedItems, setReceivedItems] = useState<GoodsReceived[]>([]);
  const [formData, setFormData] = useState<{
    items: Array<{ product_id: number; quantity_received: number }>;
    total_items: number;
    damaged_items: number;
    notes: string;
  }>({
    items: [],
    total_items: 0,
    damaged_items: 0,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (selectedPO) {
      loadPOItems();
      loadReceivedItems();
    }
  }, [selectedPO]);

  const loadOrders = async () => {
    try {
      const allOrders = api.purchaseOrders.list();
      // Filter to only show submitted or partially received orders
      const receivableOrders = allOrders.filter(o => o.status !== 'received' && o.status !== 'cancelled');
      setOrders(receivableOrders);
      setError('');
    } catch (err) {
      setError(arabicMode ? 'فشل تحميل أوامر الشراء' : 'Failed to load purchase orders');
      console.error(err);
    }
  };

  const loadPOItems = async () => {
    try {
      if (selectedPO) {
        const items = api.purchaseItems.list(selectedPO);
        setPoItems(items);
        // Initialize received quantities
        setFormData({
          items: items.map(item => ({ product_id: item.product_id, quantity_received: 0 })),
          total_items: 0,
          damaged_items: 0,
          notes: '',
        });
      }
    } catch (err) {
      console.error('Failed to load PO items:', err);
    }
  };

  const loadReceivedItems = async () => {
    try {
      if (selectedPO) {
        const received = api.goodsReceived.list(selectedPO);
        setReceivedItems(received);
      }
    } catch (err) {
      console.error('Failed to load received items:', err);
    }
  };

  const handleQuantityChange = (itemId: number, qty: number) => {
    setFormData({
      ...formData,
      items: formData.items.map(item =>
        item.product_id === itemId ? { ...item, quantity_received: qty } : item
      ),
    });
  };

  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = api.goodsReceived.create({
        purchase_order_id: selectedPO,
        total_items: formData.total_items,
        damaged_items: formData.damaged_items,
        items: formData.items.filter(item => item.quantity_received > 0),
        notes: formData.notes,
      });

      if (result.ok) {
        setSuccess(arabicMode ? 'تم استلام البضائع بنجاح! تم تحديث المخزون.' : 'Goods received successfully! Stock updated.');
        loadPOItems();
        loadReceivedItems();
        loadOrders();
        setFormData({
          items: [],
          total_items: 0,
          damaged_items: 0,
          notes: '',
        });
      } else {
        setError(result.error || (arabicMode ? 'فشل استلام البضائع' : 'Failed to receive goods'));
      }
    } catch (err) {
      setError(arabicMode ? 'خطأ في استلام البضائع' : 'Error receiving goods');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalQuantities = formData.items.reduce((sum, item) => sum + item.quantity_received, 0);

  const t = (ar: string, en: string) => arabicMode ? ar : en;

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      partial: { ar: 'استلام جزئي', en: 'Partial' },
      received: { ar: 'تم الاستلام', en: 'Received' },
      cancelled: { ar: 'ملغي', en: 'Cancelled' },
    };
    return statusMap[status]?.[arabicMode ? 'ar' : 'en'] || status;
  };

  return (
    <div className="products-container " style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          📥 {t('استلام البضائع', 'Goods Receiving')}
        </h1>
        <p style={{ color: '#666' }}>
          {t('استلام البضائع من أوامر الشراء وتحديث المخزون', 'Receive goods from purchase orders and update stock')}
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
        
        {/* PO List */}
        <section className="card">
          <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
              📋 {t('أوامر الشراء', 'Purchase Orders')}
            </h3>
          </div>
          
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                {t('لا توجد أوامر شراء للاستلام', 'No orders to receive')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedPO(order.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: `1px solid ${selectedPO === order.id ? 'var(--brand-accent)' : '#e5ddcf'}`,
                      background: selectedPO === order.id ? 'rgba(184, 134, 11, 0.06)' : '#fff',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{order.po_number}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{order.supplier_name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.25rem' }}>
                      {t('الحالة', 'Status')}: {getStatusText(order.status)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Items & Receiving Form */}
        <section className="card" style={{ gridColumn: 'span 2' }}>
          {selectedPO ? (
            <div>
              <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #eee' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
                  📦 {t('المنتجات المراد استلامها', 'Items to Receive')}
                </h3>
              </div>

              <form onSubmit={handleReceiveGoods} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Items Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9f5f0', borderBottom: '1px solid #eee' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>{t('المنتج', 'Product')}</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>{t('الكمية المطلوبة', 'Ordered')}</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>{t('كمية الاستلام', 'Receive Qty')}</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>{t('سعر الوحدة', 'Unit Price')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poItems.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '0.5rem' }}>{item.product_name}</td>
                          <td style={{ textAlign: 'right', padding: '0.5rem' }}>{item.quantity_ordered}</td>
                          <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                            <input
                              type="number"
                              min="0"
                              max={item.quantity_ordered}
                              value={formData.items.find(i => i.product_id === item.product_id)?.quantity_received || 0}
                              onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value))}
                              style={{ width: '80px', padding: '0.25rem 0.5rem', border: '1px solid #e5ddcf', borderRadius: '8px', textAlign: 'right' }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', padding: '0.5rem' }}>${item.unit_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div style={{ backgroundColor: '#f9f5f0', padding: '1rem', borderRadius: '12px', border: '1px solid #e5ddcf' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span>{t('إجمالي الكمية المطلوبة', 'Total Items Ordered')}:</span>
                    <span style={{ fontWeight: 'bold' }}>{poItems.reduce((sum, i) => sum + i.quantity_ordered, 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    <span>{t('إجمالي الكمية المراد استلامها', 'Total Items to Receive')}:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--brand-accent)' }}>{totalQuantities}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                        {t('إجمالي القطع *', 'Total Items *')}
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.total_items}
                        onChange={(e) => setFormData({ ...formData, total_items: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5ddcf', borderRadius: '8px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                        {t('القطع التالفة', 'Damaged Items')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.damaged_items}
                        onChange={(e) => setFormData({ ...formData, damaged_items: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5ddcf', borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {t('ملاحظات', 'Notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #e5ddcf', borderRadius: '12px', fontFamily: 'inherit' }}
                    placeholder={t('ملاحظات إضافية', 'Additional notes')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || totalQuantities === 0}
                  className="btn-primary"
                  style={{ width: '100%', fontWeight: 'bold', padding: '0.75rem' }}
                >
                  {loading ? (t('جاري المعالجة...', 'Processing...')) : (t('✓ استلام البضائع وتحديث المخزون', '✓ Receive Goods & Update Stock'))}
                </button>
              </form>

              {/* Previous Receipts */}
              {receivedItems.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>
                      📋 {t('سجلات الاستلام السابقة', 'Previous Receipts')}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {receivedItems.map((receipt) => (
                      <div key={receipt.id} style={{ backgroundColor: '#f9f5f0', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5ddcf', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ color: '#666' }}>{receipt.received_date}</span>
                          <span style={{ fontWeight: 'bold', color: 'var(--brand-accent)' }}>{receipt.total_items} {t('قطعة', 'items')}</span>
                          {receipt.damaged_items > 0 && (
                            <span style={{ color: '#dc2626' }}>{t('تالف', 'damaged')}: {receipt.damaged_items}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              {t('اختر أمر شراء لاستلام البضائع', 'Select a purchase order to receive goods')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
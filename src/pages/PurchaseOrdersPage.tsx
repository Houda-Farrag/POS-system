// import React, { useState, useEffect } from 'react';
// import { api } from '../api';
// import type { Supplier, PurchaseOrder, Product, PurchaseItem } from '../types';

// export default function PurchaseOrdersPage() {
//   const [orders, setOrders] = useState<PurchaseOrder[]>([]);
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [showForm, setShowForm] = useState(false);
//   const [selectedPO, setSelectedPO] = useState<number | null>(null);
//   const [poItems, setPoItems] = useState<PurchaseItem[]>([]);
//   const [formData, setFormData] = useState<Partial<PurchaseOrder>>({});
//   const [itemForm, setItemForm] = useState<Partial<PurchaseItem>>({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     loadData();
//   }, []);

//   useEffect(() => {
//     if (selectedPO) {
//       loadPOItems();
//     }
//   }, [selectedPO]);

//   const loadData = async () => {
//     try {
//       const [ordersData, suppliersData, productsData] = await Promise.all([
//         api.purchaseOrders.list(),
//         api.suppliers.list(),
//         api.getProducts(),
//       ]);
//       setOrders(ordersData);
//       setSuppliers(suppliersData);
//       setProducts(productsData);
//       setError('');
//     } catch (err) {
//       setError('Failed to load data');
//       console.error(err);
//     }
//   };

//   const loadPOItems = async () => {
//     try {
//       if (selectedPO) {
//         const items = api.purchaseItems.list(selectedPO);
//         setPoItems(items);
//       }
//     } catch (err) {
//       console.error('Failed to load PO items:', err);
//     }
//   };

//   const handleCreatePO = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.supplier_id) {
//       setError('Please select a supplier');
//       return;
//     }

//     setLoading(true);
//     try {
//       const result = api.purchaseOrders.create({
//         supplier_id: formData.supplier_id,
//         expected_delivery: formData.expected_delivery,
//         notes: formData.notes,
//       });

//       if (result.ok) {
//         setOrders([result.po, ...orders]);
//         setFormData({});
//         setShowForm(false);
//         setError('');
//       } else {
//         setError(result.error || 'Failed to create PO');
//       }
//     } catch (err) {
//       setError('Error creating PO');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddItem = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedPO || !itemForm.product_id) {
//       setError('Please select a product');
//       return;
//     }

//     setLoading(true);
//     try {
//       const result = api.purchaseItems.add({
//         purchase_order_id: selectedPO,
//         product_id: itemForm.product_id,
//         quantity_ordered: itemForm.quantity_ordered || 0,
//         unit_price: itemForm.unit_price || 0,
//         line_total: (itemForm.quantity_ordered || 0) * (itemForm.unit_price || 0),
//         notes: itemForm.notes,
//       });

//       if (result.ok) {
//         loadPOItems();
//         setItemForm({});
//         setError('');
//       } else {
//         setError(result.error || 'Failed to add item');
//       }
//     } catch (err) {
//       setError('Error adding item');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveItem = async (itemId: number) => {
//     if (!window.confirm('Remove this item?')) return;

//     try {
//       const result = api.purchaseItems.remove(itemId);
//       if (result.ok) {
//         loadPOItems();
//       } else {
//         setError(result.error || 'Failed to remove item');
//       }
//     } catch (err) {
//       setError('Error removing item');
//       console.error(err);
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">📋 Purchase Orders</h1>
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           {showForm ? 'Cancel' : '+ New Purchase Order'}
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {showForm && (
//         <form onSubmit={handleCreatePO} className="bg-white p-6 rounded border shadow mb-6">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Supplier *</label>
//               <select
//                 required
//                 value={formData.supplier_id || ''}
//                 onChange={(e) => setFormData({ ...formData, supplier_id: parseInt(e.target.value) })}
//                 className="w-full p-2 border rounded"
//               >
//                 <option value="">Select Supplier</option>
//                 {suppliers.map((s) => (
//                   <option key={s.id} value={s.id}>{s.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Expected Delivery Date</label>
//               <input
//                 type="date"
//                 value={formData.expected_delivery || ''}
//                 onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//           </div>
//           <div className="mt-4">
//             <label className="block text-sm font-medium mb-1">Notes</label>
//             <textarea
//               value={formData.notes || ''}
//               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//               className="w-full p-2 border rounded"
//               rows={2}
//             />
//           </div>
//           <div className="mt-4 flex gap-2">
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
//             >
//               {loading ? 'Creating...' : 'Create PO'}
//             </button>
//             <button
//               type="button"
//               onClick={() => setShowForm(false)}
//               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-1">
//           <h2 className="font-bold text-lg mb-4">POs List</h2>
//           <div className="space-y-2 max-h-96 overflow-y-auto">
//             {orders.length === 0 ? (
//               <p className="text-gray-500">No purchase orders</p>
//             ) : (
//               orders.map((order) => (
//                 <button
//                   key={order.id}
//                   onClick={() => setSelectedPO(order.id)}
//                   className={`w-full p-3 text-left rounded border ${
//                     selectedPO === order.id
//                       ? 'bg-blue-100 border-blue-500'
//                       : 'bg-white border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <div className="font-medium">{order.po_number}</div>
//                   <div className="text-sm text-gray-600">{order.supplier_name}</div>
//                   <div className="text-sm font-semibold text-green-600">${order.total_amount}</div>
//                   <div className="text-xs text-gray-500">{order.status}</div>
//                 </button>
//               ))
//             )}
//           </div>
//         </div>

//         <div className="lg:col-span-2">
//           {selectedPO ? (
//             <div>
//               <h2 className="font-bold text-lg mb-4">PO Items</h2>

//               <form onSubmit={handleAddItem} className="bg-white p-4 rounded border shadow mb-4">
//                 <div className="grid grid-cols-3 gap-2">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Product</label>
//                     <select
//                       required
//                       value={itemForm.product_id || ''}
//                       onChange={(e) => setItemForm({ ...itemForm, product_id: parseInt(e.target.value) })}
//                       className="w-full p-2 border rounded text-sm"
//                     >
//                       <option value="">Select</option>
//                       {products.map((p) => (
//                         <option key={p.id} value={p.id}>{p.name}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Qty</label>
//                     <input
//                       type="number"
//                       min="1"
//                       value={itemForm.quantity_ordered || ''}
//                       onChange={(e) => setItemForm({ ...itemForm, quantity_ordered: parseInt(e.target.value) })}
//                       className="w-full p-2 border rounded text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">Price</label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       value={itemForm.unit_price || ''}
//                       onChange={(e) => setItemForm({ ...itemForm, unit_price: parseFloat(e.target.value) })}
//                       className="w-full p-2 border rounded text-sm"
//                     />
//                   </div>
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
//                 >
//                   Add Item
//                 </button>
//               </form>

//               <div className="space-y-2">
//                 {poItems.length === 0 ? (
//                   <p className="text-gray-500 text-center py-8">No items. Add one above.</p>
//                 ) : (
//                   poItems.map((item) => (
//                     <div key={item.id} className="bg-white p-3 rounded border flex justify-between items-center">
//                       <div>
//                         <div className="font-medium">{item.product_name}</div>
//                         <div className="text-sm text-gray-600">{item.quantity_ordered} × ${item.unit_price}</div>
//                       </div>
//                       <div className="text-right">
//                         <div className="font-bold">${item.line_total}</div>
//                         <button
//                           onClick={() => handleRemoveItem(item.id)}
//                           className="text-red-500 text-sm hover:underline"
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           ) : (
//             <p className="text-gray-500 text-center py-8">Select a PO to view items</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Supplier, PurchaseOrder, Product, PurchaseItem } from '../types';

export default function PurchaseOrdersPage({ arabicMode }: { arabicMode: boolean }) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPO, setSelectedPO] = useState<number | null>(null);
  const [poItems, setPoItems] = useState<PurchaseItem[]>([]);
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({});
  const [itemForm, setItemForm] = useState<Partial<PurchaseItem>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPO) {
      loadPOItems();
    }
  }, [selectedPO]);

  const loadData = async () => {
    try {
      const [ordersData, suppliersData, productsData] = await Promise.all([
        api.purchaseOrders.list(),
        api.suppliers.list(),
        api.getProducts(),
      ]);
      setOrders(ordersData);
      setSuppliers(suppliersData);
      setProducts(productsData);
      setError('');
    } catch (err) {
      setError(arabicMode ? 'فشل تحميل البيانات' : 'Failed to load data');
      console.error(err);
    }
  };

  const loadPOItems = async () => {
    try {
      if (selectedPO) {
        const items = api.purchaseItems.list(selectedPO);
        setPoItems(items);
      }
    } catch (err) {
      console.error('Failed to load PO items:', err);
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier_id) {
      setError(arabicMode ? 'الرجاء اختيار المورد' : 'Please select a supplier');
      return;
    }

    setLoading(true);
    try {
      const result = api.purchaseOrders.create({
        supplier_id: formData.supplier_id,
        expected_delivery: formData.expected_delivery,
        notes: formData.notes,
      });

      if (result.ok) {
        setOrders([result.po, ...orders]);
        setFormData({});
        setShowForm(false);
        setError('');
        setMessage(arabicMode ? 'تم إنشاء أمر الشراء' : 'Purchase order created');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(result.error || (arabicMode ? 'فشل إنشاء أمر الشراء' : 'Failed to create PO'));
      }
    } catch (err) {
      setError(arabicMode ? 'خطأ في إنشاء أمر الشراء' : 'Error creating PO');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO || !itemForm.product_id) {
      setError(arabicMode ? 'الرجاء اختيار المنتج' : 'Please select a product');
      return;
    }

    setLoading(true);
    try {
      const result = api.purchaseItems.add({
        purchase_order_id: selectedPO,
        product_id: itemForm.product_id,
        quantity_ordered: itemForm.quantity_ordered || 0,
        unit_price: itemForm.unit_price || 0,
        line_total: (itemForm.quantity_ordered || 0) * (itemForm.unit_price || 0),
        notes: itemForm.notes,
      });

      if (result.ok) {
        loadPOItems();
        setItemForm({});
        setError('');
        setMessage(arabicMode ? 'تم إضافة المنتج' : 'Item added');
        setTimeout(() => setMessage(''), 2000);
      } else {
        setError(result.error || (arabicMode ? 'فشل إضافة المنتج' : 'Failed to add item'));
      }
    } catch (err) {
      setError(arabicMode ? 'خطأ في إضافة المنتج' : 'Error adding item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    const ok = window.confirm(arabicMode ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to remove this item?');
    if (!ok) return;

    try {
      const result = api.purchaseItems.remove(itemId);
      if (result.ok) {
        loadPOItems();
        setMessage(arabicMode ? 'تم حذف المنتج' : 'Item removed');
        setTimeout(() => setMessage(''), 2000);
      } else {
        setError(result.error || (arabicMode ? 'فشل حذف المنتج' : 'Failed to remove item'));
      }
    } catch (err) {
      setError(arabicMode ? 'خطأ في حذف المنتج' : 'Error removing item');
      console.error(err);
    }
  };

  const t = (ar: string, en: string) => arabicMode ? ar : en;

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      partial: { ar: 'استلام جزئي', en: 'Partial' },
      received: { ar: 'تم الاستلام', en: 'Received' },
    };
    return statusMap[status]?.[arabicMode ? 'ar' : 'en'] || status;
  };

  return (
    <div className="products-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* CREATE PO SECTION */}
      {showForm && (
        <section className="card">
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{t('إنشاء أمر شراء جديد', 'New Purchase Order')}</h3>
          </div>

          <form onSubmit={handleCreatePO}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('المورد *', 'Supplier *')}</small></label>
                <select
                  required
                  className="select-input"
                  value={formData.supplier_id || ''}
                  onChange={(e) => setFormData({ ...formData, supplier_id: parseInt(e.target.value) })}
                >
                  <option value="">{t('اختر المورد', 'Select Supplier')}</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('تاريخ التسليم المتوقع', 'Expected Delivery Date')}</small></label>
                <input
                  type="date"
                  value={formData.expected_delivery || ''}
                  onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('ملاحظات', 'Notes')}</small></label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  style={{ border: '1px solid #e5ddcf', borderRadius: '12px', padding: '0.65rem 0.8rem', fontFamily: 'inherit' }}
                  placeholder={t('ملاحظات إضافية', 'Additional notes')}
                />
              </div>
            </div>

            <div className="chips" style={{ marginTop: '1.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              {message && <small className="ok-text" style={{ marginInlineEnd: 'auto' }}>{message}</small>}
              {error && <small className="error-text" style={{ marginInlineEnd: 'auto' }}>{error}</small>}
              <button type="button" className="chip danger-chip" onClick={() => {
                setShowForm(false);
                setFormData({});
                setError('');
                setMessage('');
              }}>
                {t('إلغاء', 'Cancel')}
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ paddingInline: '2rem' }}>
                {loading ? (t('جاري الإنشاء...', 'Creating...')) : (t('إنشاء', 'Create PO'))}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* MAIN SECTION - PO LIST AND ITEMS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN - PO LIST */}
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>{t('أوامر الشراء', 'Purchase Orders')}</h3>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setFormData({});
                setError('');
                setMessage('');
              }}
              className="btn-accent"
              style={{ whiteSpace: 'nowrap' }}
            >
              {showForm ? t('إلغاء', 'Cancel') : `+ ${t('أمر شراء جديد', 'New PO')}`}
            </button>
          </div>

          {error && !showForm && (
            <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>
          )}

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                {t('لا توجد أوامر شراء', 'No purchase orders')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedPO(order.id)}
                    style={{
                      cursor: 'pointer',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: `1px solid ${selectedPO === order.id ? 'var(--brand-accent)' : '#e5ddcf'}`,
                      background: selectedPO === order.id ? 'rgba(184, 134, 11, 0.06)' : '#fff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{order.po_number}</div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>{order.supplier_name}</div>
                      </div>
                      <span className={`status ${order.status === 'received' ? 'paid' : order.status === 'draft' || order.status === 'submitted' ? 'unpaid' : 'partial'}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div style={{ fontWeight: 'bold', color: 'var(--brand-accent)' }}>
                      ${order.total_amount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN - PO ITEMS */}
        <section className="card">
          {selectedPO ? (
            <>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>
                  {t('منتجات أمر الشراء', 'PO Items')}
                  <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#666', marginLeft: '0.5rem' }}>
                    #{orders.find(o => o.id === selectedPO)?.po_number}
                  </span>
                </h3>
              </div>

              {/* ADD ITEM FORM */}
              <form onSubmit={handleAddItem} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label><small>{t('المنتج', 'Product')}</small></label>
                    <select
                      required
                      className="select-input"
                      value={itemForm.product_id || ''}
                      onChange={(e) => {
                        const productId = parseInt(e.target.value);
                        const product = products.find(p => p.id === productId);
                        setItemForm({ 
                          ...itemForm, 
                          product_id: productId,
                          unit_price: product?.price || 0
                        });
                      }}
                    >
                      <option value="">{t('اختر منتج', 'Select Product')}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label><small>{t('الكمية', 'Quantity')}</small></label>
                    <input
                      type="number"
                      min="1"
                      value={itemForm.quantity_ordered || ''}
                      onChange={(e) => setItemForm({ ...itemForm, quantity_ordered: parseInt(e.target.value) })}
                      placeholder={t('الكمية', 'Qty')}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label><small>{t('السعر', 'Price')}</small></label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemForm.unit_price || ''}
                      onChange={(e) => setItemForm({ ...itemForm, unit_price: parseFloat(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="chips" style={{ justifyContent: 'flex-end' }}>
                  {error && <small className="error-text" style={{ marginInlineEnd: 'auto' }}>{error}</small>}
                  {message && <small className="ok-text" style={{ marginInlineEnd: 'auto' }}>{message}</small>}
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? t('جاري الإضافة...', 'Adding...') : `+ ${t('إضافة', 'Add Item')}`}
                  </button>
                </div>
              </form>

              {/* ITEMS LIST */}
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {poItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    {t('لا توجد منتجات. أضف منتجاً أعلاه.', 'No items. Add one above.')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {poItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: '1px solid #e5ddcf',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '500' }}>{item.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>
                            {item.quantity_ordered} × ${item.unit_price.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: 'var(--brand-accent)' }}>
                            ${item.line_total.toFixed(2)}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="chip danger-chip"
                            style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}
                          >
                            {t('حذف', 'Remove')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PO TOTAL */}
              {poItems.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #eee', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>{t('الإجمالي', 'Total')}: </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--brand-accent)' }}>
                    ${poItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              {t('اختر أمر شراء لعرض المنتجات', 'Select a PO to view items')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
// // import React, { useState, useEffect } from 'react';
// // import { api } from '../api';
// // import type { Supplier } from '../types';

// // export default function SuppliersPage() {
// //   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
// //   const [showForm, setShowForm] = useState(false);
// //   const [editingId, setEditingId] = useState<number | null>(null);
// //   const [formData, setFormData] = useState<Partial<Supplier>>({});
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string>('');

// //   useEffect(() => {
// //     loadSuppliers();
// //   }, []);

// //   const loadSuppliers = async () => {
// //     try {
// //       const data = api.suppliers.list();
// //       setSuppliers(data);
// //       setError('');
// //     } catch (err) {
// //       setError('Failed to load suppliers');
// //       console.error(err);
// //     }
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       if (editingId) {
// //         const result = api.suppliers.update(editingId, formData);
// //         if (result.ok) {
// //           setSuppliers(suppliers.map(s => s.id === editingId ? result.supplier : s));
// //         } else {
// //           setError(result.error || 'Failed to update supplier');
// //         }
// //       } else {
// //         const result = api.suppliers.create(formData as Omit<Supplier, 'id' | 'is_active'>);
// //         if (result.ok) {
// //           setSuppliers([...suppliers, result.supplier]);
// //         } else {
// //           setError(result.error || 'Failed to create supplier');
// //         }
// //       }
// //       setFormData({});
// //       setShowForm(false);
// //       setEditingId(null);
// //     } catch (err) {
// //       setError('Error saving supplier');
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleEdit = (supplier: Supplier) => {
// //     setFormData(supplier);
// //     setEditingId(supplier.id);
// //     setShowForm(true);
// //   };

// //   const handleDelete = async (id: number) => {
// //     if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    
// //     try {
// //       const result = api.suppliers.delete(id);
// //       if (result.ok) {
// //         setSuppliers(suppliers.filter(s => s.id !== id));
// //       } else {
// //         setError(result.error || 'Failed to delete supplier');
// //       }
// //     } catch (err) {
// //       setError('Error deleting supplier');
// //       console.error(err);
// //     }
// //   };

// //   const handleClose = () => {
// //     setFormData({});
// //     setShowForm(false);
// //     setEditingId(null);
// //     setError('');
// //   };

// //   return (
// //     <div className="p-6">
// //       <div className="flex justify-between items-center mb-6">
// //         <h1 className="text-3xl font-bold">📦 Suppliers</h1>
// //         <button
// //           onClick={() => setShowForm(!showForm)}
// //           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
// //         >
// //           {showForm ? 'Cancel' : '+ New Supplier'}
// //         </button>
// //       </div>

// //       {error && (
// //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
// //           {error}
// //         </div>
// //       )}

// //       {showForm && (
// //         <form onSubmit={handleSubmit} className="bg-white p-6 rounded border shadow mb-6">
// //           <div className="grid grid-cols-2 gap-4">
// //             <div>
// //               <label className="block text-sm font-medium mb-1">Supplier Name *</label>
// //               <input
// //                 type="text"
// //                 required
// //                 value={formData.name || ''}
// //                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
// //                 className="w-full p-2 border rounded"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium mb-1">Contact Person</label>
// //               <input
// //                 type="text"
// //                 value={formData.contact_person || ''}
// //                 onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
// //                 className="w-full p-2 border rounded"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium mb-1">Email</label>
// //               <input
// //                 type="email"
// //                 value={formData.email || ''}
// //                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
// //                 className="w-full p-2 border rounded"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium mb-1">Phone</label>
// //               <input
// //                 type="tel"
// //                 value={formData.phone || ''}
// //                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
// //                 className="w-full p-2 border rounded"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium mb-1">Address</label>
// //               <input
// //                 type="text"
// //                 value={formData.address || ''}
// //                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
// //                 className="w-full p-2 border rounded"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium mb-1">City</label>
// //               <input
// //                 type="text"
// //                 value={formData.city || ''}
// //                 onChange={(e) => setFormData({ ...formData, city: e.target.value })}
// //                 className="w-full p-2 border rounded"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium mb-1">Payment Terms</label>
// //               <input
// //                 type="text"
// //                 value={formData.payment_terms || ''}
// //                 onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
// //                 className="w-full p-2 border rounded"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium mb-1">Tax ID</label>
// //               <input
// //                 type="text"
// //                 value={formData.tax_id || ''}
// //                 onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
// //                 className="w-full p-2 border rounded"
// //               />
// //             </div>
// //           </div>
// //           <div className="mt-4">
// //             <label className="block text-sm font-medium mb-1">Notes</label>
// //             <textarea
// //               value={formData.notes || ''}
// //               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
// //               className="w-full p-2 border rounded"
// //               rows={3}
// //             />
// //           </div>
// //           <div className="mt-6 flex gap-2">
// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
// //             >
// //               {loading ? 'Saving...' : 'Save Supplier'}
// //             </button>
// //             <button
// //               type="button"
// //               onClick={handleClose}
// //               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
// //             >
// //               Cancel
// //             </button>
// //           </div>
// //         </form>
// //       )}

// //       <div className="grid gap-4">
// //         {suppliers.length === 0 ? (
// //           <p className="text-gray-500 text-center py-8">No suppliers found. Create one to get started!</p>
// //         ) : (
// //           suppliers.map((supplier) => (
// //             <div key={supplier.id} className="bg-white p-4 rounded border shadow hover:shadow-lg">
// //               <div className="flex justify-between items-start">
// //                 <div className="flex-1">
// //                   <h3 className="font-bold text-lg">{supplier.name}</h3>
// //                   {supplier.contact_person && <p className="text-gray-600">{supplier.contact_person}</p>}
// //                   <p className="text-gray-500 text-sm">{supplier.email} | {supplier.phone}</p>
// //                   {supplier.address && <p className="text-gray-500 text-sm">{supplier.address}, {supplier.city}</p>}
// //                   {supplier.payment_terms && <p className="text-gray-500 text-sm">Terms: {supplier.payment_terms}</p>}
// //                 </div>
// //                 <div className="flex gap-2">
// //                   <button
// //                     onClick={() => handleEdit(supplier)}
// //                     className="text-blue-500 hover:text-blue-700 px-3 py-1 border border-blue-500 rounded hover:bg-blue-50"
// //                   >
// //                     Edit
// //                   </button>
// //                   <button
// //                     onClick={() => handleDelete(supplier.id)}
// //                     className="text-red-500 hover:text-red-700 px-3 py-1 border border-red-500 rounded hover:bg-red-50"
// //                   >
// //                     Delete
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           ))
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useState, useEffect } from 'react';
// import { api } from '../api';
// import type { Supplier } from '../types';

// export default function SuppliersPage() {
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [formData, setFormData] = useState<Partial<Supplier>>({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     loadSuppliers();
//   }, []);

//   const loadSuppliers = async () => {
//     try {
//       const data = api.suppliers.list();
//       setSuppliers(data);
//       setError('');
//     } catch (err) {
//       setError('Failed to load suppliers');
//       console.error(err);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (editingId) {
//         const result = api.suppliers.update(editingId, formData);
//         if (result.ok) {
//           setSuppliers(suppliers.map(s => s.id === editingId ? result.supplier : s));
//         } else {
//           setError(result.error || 'Failed to update supplier');
//         }
//       } else {
//         const result = api.suppliers.create(formData as Omit<Supplier, 'id' | 'is_active'>);
//         if (result.ok) {
//           setSuppliers([...suppliers, result.supplier]);
//         } else {
//           setError(result.error || 'Failed to create supplier');
//         }
//       }
//       setFormData({});
//       setShowForm(false);
//       setEditingId(null);
//     } catch (err) {
//       setError('Error saving supplier');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (supplier: Supplier) => {
//     setFormData(supplier);
//     setEditingId(supplier.id);
//     setShowForm(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    
//     try {
//       const result = api.suppliers.delete(id);
//       if (result.ok) {
//         setSuppliers(suppliers.filter(s => s.id !== id));
//       } else {
//         setError(result.error || 'Failed to delete supplier');
//       }
//     } catch (err) {
//       setError('Error deleting supplier');
//       console.error(err);
//     }
//   };

//   const handleClose = () => {
//     setFormData({});
//     setShowForm(false);
//     setEditingId(null);
//     setError('');
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">📦 Suppliers</h1>
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="btn-accent"
//         >
//           {showForm ? 'Cancel' : '+ New Supplier'}
//         </button>
//       </div>

//       {error && (
//         <div className="error-text mb-4 p-3 bg-red-50 rounded-lg">
//           {error}
//         </div>
//       )}

//       {showForm && (
//         <form onSubmit={handleSubmit} className="card mb-6">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Supplier Name *</label>
//               <input
//                 type="text"
//                 required
//                 value={formData.name || ''}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Contact Person</label>
//               <input
//                 type="text"
//                 value={formData.contact_person || ''}
//                 onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Email</label>
//               <input
//                 type="email"
//                 value={formData.email || ''}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Phone</label>
//               <input
//                 type="tel"
//                 value={formData.phone || ''}
//                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Address</label>
//               <input
//                 type="text"
//                 value={formData.address || ''}
//                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">City</label>
//               <input
//                 type="text"
//                 value={formData.city || ''}
//                 onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Payment Terms</label>
//               <input
//                 type="text"
//                 value={formData.payment_terms || ''}
//                 onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
//                 className="w-full"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Tax ID</label>
//               <input
//                 type="text"
//                 value={formData.tax_id || ''}
//                 onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
//                 className="w-full"
//               />
//             </div>
//           </div>
//           <div className="mt-4">
//             <label className="block text-sm font-medium mb-1">Notes</label>
//             <textarea
//               value={formData.notes || ''}
//               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//               className="w-full p-2 border rounded"
//               rows={3}
//             />
//           </div>
//           <div className="mt-6 flex gap-2">
//             <button
//               type="submit"
//               disabled={loading}
//               className="btn-primary disabled:opacity-50"
//             >
//               {loading ? 'Saving...' : 'Save Supplier'}
//             </button>
//             <button
//               type="button"
//               onClick={handleClose}
//               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}

//       <div className="grid gap-4">
//         {suppliers.length === 0 ? (
//           <p className="text-gray-500 text-center py-8">No suppliers found. Create one to get started!</p>
//         ) : (
//           suppliers.map((supplier) => (
//             <div key={supplier.id} className="card hover:shadow-lg transition-shadow">
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <h3 className="font-bold text-lg">{supplier.name}</h3>
//                   {supplier.contact_person && <p className="text-gray-600">{supplier.contact_person}</p>}
//                   <p className="text-gray-500 text-sm">{supplier.email} | {supplier.phone}</p>
//                   {supplier.address && <p className="text-gray-500 text-sm">{supplier.address}, {supplier.city}</p>}
//                   {supplier.payment_terms && <p className="text-gray-500 text-sm">Terms: {supplier.payment_terms}</p>}
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handleEdit(supplier)}
//                     className="text-blue-500 hover:text-blue-700 px-3 py-1 border border-blue-500 rounded hover:bg-blue-50"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(supplier.id)}
//                     className="text-red-500 hover:text-red-700 px-3 py-1 border border-red-500 rounded hover:bg-red-50"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import type { Supplier } from '../types';

export default function SuppliersPage({ arabicMode }: { arabicMode: boolean }) {
  const [refresh, setRefresh] = useState(0);
  const suppliers = useMemo(() => api.suppliers.list(), [refresh]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState('');

  const loadSuppliers = () => {
    try {
      setError('');
    } catch (err) {
      setError(arabicMode ? 'فشل تحميل الموردين' : 'Failed to load suppliers');
      console.error(err);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [refresh]);

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
    setShowForm(false);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const result = api.suppliers.update(editingId, formData);
        if (result.ok) {
          setRefresh(v => v + 1);
          setMessage(arabicMode ? 'تم تحديث المورد' : 'Supplier updated');
        } else {
          setError(result.error || (arabicMode ? 'فشل تحديث المورد' : 'Failed to update supplier'));
        }
      } else {
        const result = api.suppliers.create(formData as Omit<Supplier, 'id' | 'is_active'>);
        if (result.ok) {
          setRefresh(v => v + 1);
          setMessage(arabicMode ? 'تم إضافة المورد' : 'Supplier added');
        } else {
          setError(result.error || (arabicMode ? 'فشل إضافة المورد' : 'Failed to create supplier'));
        }
      }
      resetForm();
    } catch (err) {
      setError(arabicMode ? 'خطأ في حفظ المورد' : 'Error saving supplier');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData(supplier);
    setEditingId(supplier.id);
    setShowForm(true);
    setError('');
    setMessage('');
  };

  const handleDelete = async (supplier: Supplier) => {
    const ok = window.confirm(
      arabicMode ? `هل أنت متأكد من حذف المورد ${supplier.name}؟` : `Are you sure you want to delete supplier ${supplier.name}?`
    );
    if (!ok) return;
    
    try {
      const result = api.suppliers.delete(supplier.id);
      if (result.ok) {
        setRefresh(v => v + 1);
        setMessage(arabicMode ? 'تم حذف المورد' : 'Supplier deleted');
      } else {
        setError(result.error || (arabicMode ? 'فشل حذف المورد' : 'Failed to delete supplier'));
      }
    } catch (err) {
      setError(arabicMode ? 'خطأ في حذف المورد' : 'Error deleting supplier');
      console.error(err);
    }
  };

  const handleClose = () => {
    resetForm();
  };

  const t = (ar: string, en: string) => arabicMode ? ar : en;

  return (
    <div className="products-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ADD/EDIT SECTION */}
      {showForm && (
        <section className="card">
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>
              {editingId ? t('تعديل المورد', 'Edit Supplier') : t('إضافة مورد جديد', 'Add New Supplier')}
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('اسم المورد *', 'Supplier Name *')}</small></label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('الاسم', 'Name')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('جهة الاتصال', 'Contact Person')}</small></label>
                <input
                  type="text"
                  value={formData.contact_person || ''}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder={t('اسم جهة الاتصال', 'Contact name')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('البريد الإلكتروني', 'Email')}</small></label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@company.com"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('رقم الهاتف', 'Phone')}</small></label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('رقم الهاتف', 'Phone number')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('العنوان', 'Address')}</small></label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t('العنوان', 'Address')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('المدينة', 'City')}</small></label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={t('المدينة', 'City')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('شروط الدفع', 'Payment Terms')}</small></label>
                <input
                  type="text"
                  value={formData.payment_terms || ''}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  placeholder={t('مثلاً: 30 يوم', 'e.g., Net 30')}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('الرقم الضريبي', 'Tax ID')}</small></label>
                <input
                  type="text"
                  value={formData.tax_id || ''}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  placeholder={t('الرقم الضريبي', 'Tax ID')}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label><small>{t('ملاحظات', 'Notes')}</small></label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder={t('ملاحظات إضافية عن المورد', 'Additional notes about the supplier')}
                  style={{ border: '1px solid #e5ddcf', borderRadius: '12px', padding: '0.65rem 0.8rem', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div className="chips" style={{ marginTop: '1.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              {message && <small className="ok-text" style={{ marginInlineEnd: 'auto' }}>{message}</small>}
              {error && <small className="error-text" style={{ marginInlineEnd: 'auto' }}>{error}</small>}
              {editingId && (
                <button type="button" className="chip danger-chip" onClick={handleClose}>
                  {t('إلغاء', 'Cancel')}
                </button>
              )}
              <button type="submit" className="btn-primary" disabled={loading} style={{ paddingInline: '2rem' }}>
                {loading ? (t('جاري الحفظ...', 'Saving...')) : (editingId ? t('تحديث', 'Update') : t('حفظ', 'Save'))}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* LIST SECTION */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>{t('إدارة الموردين', 'Supplier Management')}</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {message && !showForm && <small className="ok-text">{message}</small>}
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="btn-accent"
              style={{ whiteSpace: 'nowrap' }}
            >
              {showForm ? t('إلغاء', 'Cancel') : `+ ${t('مورد جديد', 'New Supplier')}`}
            </button>
          </div>
        </div>

        {error && !showForm && (
          <div className="error-text mb-4 p-3 bg-red-50 rounded-lg" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ overflowX: 'auto' }} className="table-card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: arabicMode ? 'right' : 'left' }}>{t('اسم المورد', 'Supplier Name')}</th>
                <th>{t('جهة الاتصال', 'Contact Person')}</th>
                <th>{t('البريد الإلكتروني', 'Email')}</th>
                <th>{t('الهاتف', 'Phone')}</th>
                <th>{t('الموقع', 'Location')}</th>
                <th style={{ textAlign: arabicMode ? 'left' : 'right' }}>{t('إجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ fontWeight: '500' }}>{supplier.name}</td>
                  <td>{supplier.contact_person || '—'}</td>
                  <td>{supplier.email || '—'}</td>
                  <td>{supplier.phone || '—'}</td>
                  <td>
                    {supplier.city ? `${supplier.city}${supplier.address ? `, ${supplier.address}` : ''}` : (supplier.address || '—')}
                  </td>
                  <td>
                    <div className="chips" style={{ justifyContent: arabicMode ? 'flex-start' : 'flex-end' }}>
                      <button className="chip" onClick={() => handleEdit(supplier)}>
                        {t('تعديل', 'Edit')}
                      </button>
                      <button className="chip danger-chip" onClick={() => handleDelete(supplier)}>
                        {t('حذف', 'Delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {suppliers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              {t('لا يوجد موردون. قم بإضافة مورد جديد للبدء!', 'No suppliers found. Create one to get started!')}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
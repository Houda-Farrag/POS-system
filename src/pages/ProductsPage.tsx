import { useMemo, useState } from "react";
import { api } from "../api";
import type { Product } from "../types";

export function ProductsPage({ arabicMode }: { arabicMode: boolean }) {
  const [refresh, setRefresh] = useState(0);
  const products = useMemo(() => api.getProducts(), [refresh]);
  const [search, setSearch] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", unit: "piece", price: 0, stock: 0 });
  const units = ["kg", "piece", "meter", "cubic meter", "bag"];

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const resetForm = () => {
    setForm({ name: "", unit: "piece", price: 0, stock: 0 });
    setEditingProductId(null);
    setMessage("");
  };

  const saveProduct = () => {
    if (!form.name || form.price <= 0) return;
    if (editingProductId) {
      api.updateProduct({ id: editingProductId, ...form });
      setMessage(arabicMode ? "تم تحديث المنتج" : "Product updated");
    } else {
      api.addProduct(form);
      setMessage(arabicMode ? "تم إضافة المنتج" : "Product added");
    }
    resetForm();
    setRefresh((v) => v + 1);
  };

  const startEdit = (product: Product) => {
    setEditingProductId(product.id);
    setForm({ name: product.name, unit: product.unit, price: product.price, stock: product.stock });
  };

  const deleteProduct = (product: Product) => {
    const ok = window.confirm(arabicMode ? `حذف المنتج ${product.name}؟` : `Delete product ${product.name}?`);
    if (!ok) return;
    try {
      api.deleteProduct(product.id);
      setMessage(arabicMode ? "تم حذف المنتج" : "Product deleted");
      setRefresh((v) => v + 1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : arabicMode ? "فشل الحذف" : "Delete failed");
    }

  };

  return (
    <div className="products-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ADD/EDIT SECTION - Organized into a logical grid */}
      <section className="card">
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>
            {editingProductId ? (arabicMode ? "تعديل المنتج" : "Edit Product") : (arabicMode ? "إضافة منتج جديد" : "Add New Product")}
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label><small>{arabicMode ? "اسم المنتج" : "Product Name"}</small></label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={arabicMode ? "الاسم" : "Name"} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label><small>{arabicMode ? "الوحدة" : "Unit"}</small></label>
            <select className="select-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label><small>{arabicMode ? "السعر" : "Price"}</small></label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="0.00" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label><small>{arabicMode ? "المخزون" : "Stock"}</small></label>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder="0" />
          </div>
        </div>

        <div className="chips" style={{ marginTop: '1.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          {message && <small className="ok-text" style={{ marginInlineEnd: 'auto' }}>{message}</small>}
          {editingProductId && (
            <button className="chip danger-chip" onClick={resetForm}>
              {arabicMode ? "إلغاء" : "Cancel"}
            </button>
          )}
          <button className="btn-primary" onClick={saveProduct} style={{ paddingInline: '2rem' }}>
            {arabicMode ? "حفظ المنتج" : "Save Product"}
          </button>
        </div>
      </section>

      {/* LIST SECTION - Better spacing and data alignment */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>{arabicMode ? "إدارة المخزون" : "Inventory Management"}</h3>
          <div style={{ minWidth: '300px' }}>
            <input
              style={{ margin: 0 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={arabicMode ? "🔍 بحث بالاسم..." : "🔍 Search products..."}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }} className="table-card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: arabicMode ? 'right' : 'left' }}>{arabicMode ? "الاسم" : "Name"}</th>
                <th>{arabicMode ? "الوحدة" : "Unit"}</th>
                <th style={{ textAlign: 'center' }}>{arabicMode ? "السعر" : "Price"}</th>
                <th style={{ textAlign: 'center' }}>{arabicMode ? "المخزون" : "Stock"}</th>
                <th style={{ textAlign: 'center' }}>{arabicMode ? "المتاح" : "Available"}</th>
                <th style={{ textAlign: arabicMode ? 'left' : 'right' }}>{arabicMode ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const available = p.available_stock ?? p.stock;
                const isLow = available < 10;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ fontWeight: '500' }}>{p.name}</td>
                    <td><span className="chip" style={{ backgroundColor: '#f0f0f0', color: '#666' }}>{p.unit}</span></td>
                    <td style={{ textAlign: 'center' }}>{p.price.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>{p.stock}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: isLow ? '#d9534f' : 'inherit', fontWeight: isLow ? 'bold' : 'normal' }}>
                        {available}
                      </span>
                      {isLow && <div style={{ fontSize: '0.7rem' }} className="warn-text">{arabicMode ? "منخفض" : "Low"}</div>}
                    </td>
                    <td>
                      <div className="chips" style={{ justifyContent: arabicMode ? 'flex-start' : 'flex-end' }}>
                        <button className="chip" onClick={() => startEdit(p)}>{arabicMode ? "تعديل" : "Edit"}</button>
                        <button className="chip danger-chip" onClick={() => deleteProduct(p)}>{arabicMode ? "حذف" : "Delete"}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              {arabicMode ? "لا توجد منتجات تطابق البحث" : "No products found matching your search"}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
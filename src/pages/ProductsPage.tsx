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
    <div className="grid-2">
      <section className="card ">
        <h3>{editingProductId ? (arabicMode ? "تعديل منتج" : "Edit Product") : arabicMode ? "إضافة منتج" : "Add Product"}</h3>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={arabicMode ? "الاسم" : "Name"} />
        <select className="select-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder={arabicMode ? "السعر" : "Price"} />
        <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder={arabicMode ? "المخزون" : "Stock"} />
        <div className="chips">
          <button className="btn-primary" onClick={saveProduct}>{arabicMode ? "حفظ" : "Save"}</button>
          {editingProductId && (
            <button className="chip danger-chip" onClick={resetForm}>
              {arabicMode ? "إلغاء" : "Cancel"}
            </button>
          )}
        </div>
        {message && <small className="ok-text">{message}</small>}
      </section>
      <section className="card">
        <h3>{arabicMode ? "قائمة المنتجات" : "Products"}</h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={arabicMode ? "بحث بالاسم" : "Search by name"}
        />
        <table>
          <thead>
            <tr>
              <th>{arabicMode ? "الاسم" : "Name"}</th>
              <th>{arabicMode ? "الوحدة" : "Unit"}</th>
              <th>{arabicMode ? "السعر" : "Price"}</th>
              <th>{arabicMode ? "المخزون" : "Stock"}</th>
              <th>{arabicMode ? "المتاح" : "Available"}</th>
              <th>{arabicMode ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const available = p.available_stock ?? p.stock;
              const isLow = available < 10;
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.unit}</td>
                  <td>{p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    {available} {isLow && <small className="warn-text">({arabicMode ? "منخفض" : "Low"})</small>}
                  </td>
                  <td>
                    <div className="chips">
                      <button className="chip" onClick={() => startEdit(p)}>{arabicMode ? "تعديل" : "Edit"}</button>
                      <button className="chip danger-chip" onClick={() => deleteProduct(p)}>{arabicMode ? "حذف" : "Delete"}</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

import { useMemo, useState } from "react";
import { api } from "../api";
import type { Product } from "../types";

export function PosPage({ arabicMode }: { arabicMode: boolean }) {
  const [refresh, setRefresh] = useState(0);
  const products = useMemo(() => api.getProducts(), [refresh]);
  const [selectedProductId, setSelectedProductId] = useState<number>(
    products[0]?.id ?? 0,
  );
  const [rows, setRows] = useState<
    Array<{ productId: number; quantity: number }>
  >([]);
  const [customerName, setCustomerName] = useState("");
  const [taxRate] = useState(0);
  const [paymentMode, setPaymentMode] = useState<
    "full" | "partial" | "reservation"
  >("full");
  const [partialAmount, setPartialAmount] = useState(0);
  const [message, setMessage] = useState("");

  const subtotal = rows.reduce((sum, row) => {
    const product = products.find((p) => p.id === row.productId);
    return sum + (product?.price ?? 0) * row.quantity;
  }, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const getProduct = (id: number): Product | undefined =>
    products.find((p) => p.id === id);
  const getAvailable = (id: number): number =>
    getProduct(id)?.available_stock ?? getProduct(id)?.stock ?? 0;
  const quantityInCart = (id: number): number =>
    rows
      .filter((r) => r.productId === id)
      .reduce((sum, r) => sum + r.quantity, 0);

  const addSelected = () => {
    if (!selectedProductId) return;
    const available = getAvailable(selectedProductId);
    const inCart = quantityInCart(selectedProductId);
    if (inCart + 1 > available) {
      setMessage(
        arabicMode
          ? "لا يمكن تجاوز المخزون المتاح"
          : "Cannot exceed available stock",
      );
      return;
    }
    const existing = rows.find((r) => r.productId === selectedProductId);
    if (!existing) {
      setRows((prev) => [
        ...prev,
        { productId: selectedProductId, quantity: 1 },
      ]);
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.productId === selectedProductId
          ? { ...r, quantity: r.quantity + 1 }
          : r,
      ),
    );
  };

  const changeQty = (productId: number, delta: number) => {
    const available = getAvailable(productId);
    setRows((prev) =>
      prev
        .map((row) => {
          if (row.productId !== productId) return row;
          const nextQty = row.quantity + delta;
          if (nextQty <= 0) return { ...row, quantity: 0 };
          if (nextQty > available) return row;
          return { ...row, quantity: nextQty };
        })
        .filter((row) => row.quantity > 0),
    );
  };

  const removeRow = (productId: number) =>
    setRows((prev) => prev.filter((r) => r.productId !== productId));

  // const handleSave = () => {
  //   try {
  //     if (!rows.length) {
  //       setMessage(
  //         arabicMode
  //           ? "أضف صنفاً واحداً على الأقل"
  //           : "Add at least one product",
  //       );
  //       return;
  //     }
  //     if (paymentMode === "reservation") {
  //       api.createReservation({ customerName, items: rows });
  //       setMessage(
  //         arabicMode
  //           ? "تم حفظ الحجز لمدة 48 ساعة"
  //           : "Reservation saved for 48 hours",
  //       );
  //     } else {
  //       const paidAmount = paymentMode === "full" ? total : partialAmount;
  //       if (paidAmount < 0 || paidAmount > total) {
  //         setMessage(
  //           arabicMode ? "المبلغ المدفوع غير صالح" : "Invalid paid amount",
  //         );
  //         return;
  //       }

  //       api.createInvoice({ customerName, paidAmount, taxRate, items: rows });
  //       setMessage(
  //         arabicMode
  //           ? "تم إنشاء الفاتورة بنجاح"
  //           : "Invoice created successfully",
  //       );
  //     }
  //     setRows([]);
  //     setCustomerName("");
  //     setPartialAmount(0);
  //     setRefresh((v) => v + 1);
  //   } catch (err) {}
  // };
const handleSave = () => {
    try {
      // 1. Check if the cart is empty
      if (!rows.length) {
        setMessage(
          arabicMode
            ? "أضف صنفاً واحداً على الأقل"
            : "Add at least one product",
        );
        return;
      }

      // 2. NEW: Check if Customer Name is empty
      if (!customerName.trim()) {
        setMessage(
          arabicMode 
            ? "يرجى إدخال اسم العميل" 
            : "Please enter customer name"
        );
        return;
      }

      if (paymentMode === "reservation") {
        api.createReservation({ customerName, items: rows });
        setMessage(
          arabicMode
            ? "تم حفظ الحجز لمدة 48 ساعة"
            : "Reservation saved for 48 hours",
        );
      } else {
        const paidAmount = paymentMode === "full" ? total : partialAmount;
        if (paidAmount < 0 || paidAmount > total) {
          setMessage(
            arabicMode ? "المبلغ المدفوع غير صالح" : "Invalid paid amount",
          );
          return;
        }
        
        api.createInvoice({ customerName, paidAmount, taxRate, items: rows });
        setMessage(
          arabicMode
            ? "تم إنشاء الفاتورة بنجاح"
            : "Invoice created successfully",
        );
      }

      // Reset state after success
      setRows([]);
      setCustomerName("");
      setPartialAmount(0);
      setRefresh((v) => v + 1);
    } catch (err) {
      // If the backend still throws an error, catch it here
      setMessage(
        arabicMode 
          ? "حدث خطأ أثناء الحفظ" 
          : "An error occurred while saving"
      );
      console.error(err);
    }
  };
  return (
    <div className="grid-2">
      <section className="card">
        <h3>{arabicMode ? "اختيار المواد" : "Choose Materials"}</h3>
        <select
          className="select-input"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(Number(e.target.value))}
        >
          {products.map((p) => {
            const available = p.available_stock ?? p.stock;
            return (
              <option key={p.id} value={p.id}>
                {p.name} - {p.price.toFixed(2)} (
                {arabicMode ? "المتاح" : "Available"}: {available})
              </option>
            );
          })}
        </select>
        <button className="btn-primary" onClick={addSelected}>
          {arabicMode ? "إضافة للسلة" : "Add to Cart"}
        </button>
        {(getAvailable(selectedProductId) ?? 0) < 10 && (
          <small className="warn-text">
            {arabicMode ? "تنبيه: المخزون منخفض" : "Warning: Low stock"}
          </small>
        )}
      </section>
      <section className="card">
        <h3>{arabicMode ? "إنشاء فاتورة" : "Create Invoice"}</h3>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder={arabicMode ? "اسم العميل" : "Customer Name"}
        />
        <table>
          <thead>
            <tr>
              <th>{arabicMode ? "الصنف" : "Item"}</th>
              <th>{arabicMode ? "الكمية" : "Qty"}</th>
              <th>{arabicMode ? "السعر" : "Price"}</th>
              <th>{arabicMode ? "الإجمالي" : "Total"}</th>
              <th>{arabicMode ? "إجراء" : "Action"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const product = getProduct(row.productId);
              if (!product) return null;
              return (
                <tr key={row.productId}>
                  <td>{product.name}</td>
                  <td>
                    <div className="qty-row">
                      <button
                        className="chip"
                        onClick={() => changeQty(row.productId, -1)}
                      >
                        -
                      </button>
                      <span>{row.quantity}</span>
                      <button
                        className="chip"
                        onClick={() => changeQty(row.productId, 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{product.price.toFixed(2)}</td>
                  <td>{(product.price * row.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="chip"
                      onClick={() => removeRow(row.productId)}
                    >
                      {arabicMode ? "حذف" : "Remove"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="chips payment-mode">
          <button
            className={`chip ${paymentMode === "full" ? "chip-active" : ""}`}
            onClick={() => setPaymentMode("full")}
          >
            {arabicMode ? "دفع كامل" : "Full"}
          </button>
          <button
            className={`chip ${paymentMode === "partial" ? "chip-active" : ""}`}
            onClick={() => setPaymentMode("partial")}
          >
            {arabicMode ? "دفع جزئي" : "Partial"}
          </button>
          <button
            className={`chip ${paymentMode === "reservation" ? "chip-active" : ""}`}
            onClick={() => setPaymentMode("reservation")}
          >
            {arabicMode ? "حجز 48 ساعة" : "Reservation"}
          </button>
        </div>
        {paymentMode === "partial" && (
          <input
            type="number"
            value={partialAmount}
            onChange={(e) => setPartialAmount(Number(e.target.value))}
            placeholder={
              arabicMode ? "المبلغ الجزئي المدفوع" : "Partial paid amount"
            }
          />
        )}
        <p>
          {arabicMode ? "الإجمالي الفرعي" : "Subtotal"}: {subtotal.toFixed(2)}
        </p>
        <p>
          {arabicMode ? "الضريبة" : "Tax"}: {taxAmount.toFixed(2)}
        </p>
        <p>
          {arabicMode ? "الإجمالي" : "Total"}: {total.toFixed(2)}
        </p>
        {paymentMode === "partial" && (
          <p>
            {arabicMode ? "المتبقي" : "Remaining"}:{" "}
            {(total - partialAmount).toFixed(2)}
          </p>
        )}
        {message && <small className="ok-text ">{message}</small>}
        <div className="chips">
          <button className="btn-primary" onClick={handleSave}>
            {arabicMode ? "حفظ العملية" : "Save Transaction"}
          </button>
          <button className="btn-accent " onClick={() => window.print()}>
            {arabicMode ? "طباعة" : "Print"}
          </button>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from "react";
import { api } from "../api";
import type { AuditLog } from "../types";

interface AuditLogPageProps {
  arabicMode: boolean;
}

export function AuditLogPage({ arabicMode }: AuditLogPageProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    tableName: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    try {
      setLoading(true);
      const auditLogs = api.getAuditLogs(filters);
      setLogs(auditLogs || []);
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    loadLogs();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(arabicMode ? "ar-EG" : "en-US");
    } catch {
      return dateString;
    }
  };

  const getActionLabel = (action: string) => {
    const actionMap: { [key: string]: { ar: string; en: string } } = {
      login_success: { ar: "دخول ناجح", en: "Login Success" },
      login_failed: { ar: "فشل الدخول", en: "Login Failed" },
      logout: { ar: "تسجيل خروج", en: "Logout" },
      user_created: { ar: "مستخدم تم إنشاؤه", en: "User Created" },
      user_updated: { ar: "مستخدم تم تحديثه", en: "User Updated" },
      user_deleted: { ar: "مستخدم تم حذفه", en: "User Deleted" },
      password_changed: { ar: "كلمة المرور تم تغييرها", en: "Password Changed" },
      product_created: { ar: "منتج تم إنشاؤه", en: "Product Created" },
      product_updated: { ar: "منتج تم تحديثه", en: "Product Updated" },
      product_deleted: { ar: "منتج تم حذفه", en: "Product Deleted" },
      invoice_created: { ar: "فاتورة تم إنشاؤها", en: "Invoice Created" },
      reservation_created: { ar: "حجز تم إنشاؤه", en: "Reservation Created" },
      backup_created: { ar: "نسخة احتياطية تمت", en: "Backup Created" },
      backup_restored: { ar: "نسخة احتياطية تم استرجاعها", en: "Backup Restored" },
      data_exported: { ar: "بيانات تم تصديرها", en: "Data Exported" },
    };
    const label = actionMap[action];
    return label ? (arabicMode ? label.ar : label.en) : action;
  };

  return (
    <div className={arabicMode ? "rtl" : ""}>
      <h2>{arabicMode ? "سجل الأنشطة" : "Audit Log"}</h2>

      <div style={{ backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "4px", marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "10px" }}>
          <div>
            <label>{arabicMode ? "البحث بالإجراء" : "Filter by Action"}</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
            >
              <option value="">{arabicMode ? "الكل" : "All"}</option>
              <option value="login_success">{getActionLabel("login_success")}</option>
              <option value="login_failed">{getActionLabel("login_failed")}</option>
              <option value="user_created">{getActionLabel("user_created")}</option>
              <option value="product_created">{getActionLabel("product_created")}</option>
              <option value="invoice_created">{getActionLabel("invoice_created")}</option>
            </select>
          </div>

          <div>
            <label>{arabicMode ? "البحث بالجدول" : "Filter by Table"}</label>
            <select
              value={filters.tableName}
              onChange={(e) => handleFilterChange("tableName", e.target.value)}
            >
              <option value="">{arabicMode ? "الكل" : "All"}</option>
              <option value="users">Users</option>
              <option value="products">Products</option>
              <option value="invoices">Invoices</option>
              <option value="reservations">Reservations</option>
            </select>
          </div>

          <div>
            <label>{arabicMode ? "من التاريخ" : "From Date"}</label>
            <input
              type="datetime-local"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
            />
          </div>

          <div>
            <label>{arabicMode ? "إلى التاريخ" : "To Date"}</label>
            <input
              type="datetime-local"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleApplyFilters}>
          {arabicMode ? "تطبيق الفلاتر" : "Apply Filters"}
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#999" }}>{arabicMode ? "جاري التحميل..." : "Loading..."}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "8px", textAlign: arabicMode ? "right" : "left" }}>{arabicMode ? "الوقت" : "Timestamp"}</th>
                <th style={{ padding: "8px", textAlign: arabicMode ? "right" : "left" }}>{arabicMode ? "المستخدم" : "User"}</th>
                <th style={{ padding: "8px", textAlign: arabicMode ? "right" : "left" }}>{arabicMode ? "الإجراء" : "Action"}</th>
                <th style={{ padding: "8px", textAlign: arabicMode ? "right" : "left" }}>{arabicMode ? "الجدول" : "Table"}</th>
                <th style={{ padding: "8px", textAlign: arabicMode ? "right" : "left" }}>{arabicMode ? "ID" : "Record ID"}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #eee", backgroundColor: log.action.includes("failed") ? "#ffe6e6" : "white" }}>
                  <td style={{ padding: "8px" }}>{formatDate(log.timestamp)}</td>
                  <td style={{ padding: "8px" }}>
                    <small>{log.username}</small>
                    <br />
                    <small style={{ color: "#999" }}>{log.display_name}</small>
                  </td>
                  <td style={{ padding: "8px" }}>{getActionLabel(log.action)}</td>
                  <td style={{ padding: "8px" }}>{log.table_name || "-"}</td>
                  <td style={{ padding: "8px" }}>{log.record_id || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {logs.length === 0 && !loading && (
        <p style={{ textAlign: "center", color: "#999", marginTop: "20px" }}>
          {arabicMode ? "لا توجد عمليات" : "No audit logs found"}
        </p>
      )}
    </div>
  );
}

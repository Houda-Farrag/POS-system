import type { PropsWithChildren } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { User } from "../types";

interface LayoutProps extends PropsWithChildren {
  user: User;
  arabicMode: boolean;
  setArabicMode: (value: boolean) => void;
  onLogout: () => void;
  permissions: string[];
}

export function Layout({ children, user, arabicMode, setArabicMode, onLogout, permissions }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm(arabicMode ? "هل أنت متأكد من تسجيل الخروج؟" : "Are you sure you want to logout?")) {
      onLogout();
      navigate("/");
    }
  };

  const can = (permission: string) => permissions.includes(permission);

  const getRoleLabel = () => {
    const roleMap: { [key: string]: { ar: string; en: string } } = {
      admin: { ar: "مسؤول", en: "Admin" },
      manager: { ar: "مدير", en: "Manager" },
      accountant: { ar: "محاسب", en: "Accountant" },
      cashier: { ar: "أمين صندوق", en: "Cashier" },
      warehouse: { ar: "أمين المخزن", en: "Warehouse" },
    };
    const role = roleMap[user.role] || { ar: user.role, en: user.role };
    return arabicMode ? role.ar : role.en;
  };

  return (
    <div className={`app-shell ${arabicMode ? "font-arabic rtl" : ""}`}>
      <div className="layout-grid">
        <aside className="sidebar">
          <h2>{arabicMode ? "أولاد السمان" : "Awlad Elsaman"}</h2>
          <div className="user-info" style={{ paddingBottom: "10px", marginBottom: "15px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
            <p style={{ fontSize: "14px", margin: "5px 0" }}>{arabicMode ? `مرحباً ${user.display_name}` : `Welcome ${user.display_name}`}</p>
            <p style={{ fontSize: "12px", opacity: 0.7, margin: "5px 0" }}>{getRoleLabel()}</p>
          </div>
          
          <nav className="nav-card side-nav">
            {can("invoices:create") && <NavLink to="/pos">{arabicMode ? "المبيعات" : "POS"}</NavLink>}
            {can("products:read") && <NavLink to="/products">{arabicMode ? "المنتجات" : "Products"}</NavLink>}
            {can("invoices:read") && <NavLink to="/invoices">{arabicMode ? "الفواتير" : "Invoices"}</NavLink>}
            {can("invoices:read") && <NavLink to="/dashboard">{arabicMode ? "لوحة المالك" : "Owner Dashboard"}</NavLink>}
            
            {/* Phase 2: Purchases Module */}
            {can("purchases:read") && (
              <>
                <hr style={{ opacity: 0.3, margin: "10px 0" }} />
                <p style={{ fontSize: "11px", opacity: 0.6, paddingLeft: "8px", margin: "5px 0" }}>
                  {arabicMode ? "المشتريات" : "Purchases"}
                </p>
                <NavLink to="/suppliers">{arabicMode ? "الموردون" : "Suppliers"}</NavLink>
                <NavLink to="/purchase-orders">{arabicMode ? "أوامر الشراء" : "Purchase Orders"}</NavLink>
                <NavLink to="/goods-receiving">{arabicMode ? "استقبال البضائع" : "Goods Receiving"}</NavLink>
                <NavLink to="/supplier-payments">{arabicMode ? "دفعات الموردين" : "Supplier Payments"}</NavLink>
              </>
            )}
            
            {/* Admin only sections */}
            {(can("users:read") || can("audit:read")) && (
              <>
                <hr style={{ opacity: 0.3, margin: "10px 0" }} />
                <p style={{ fontSize: "11px", opacity: 0.6, paddingLeft: "8px", margin: "5px 0" }}>
                  {arabicMode ? "الإدارة" : "Administration"}
                </p>
                {can("users:read") && <NavLink to="/users">{arabicMode ? "إدارة المستخدمين" : "User Management"}</NavLink>}
                {can("audit:read") && <NavLink to="/audit">{arabicMode ? "سجل الأنشطة" : "Audit Log"}</NavLink>}
              </>
            )}
          </nav>

          <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexDirection: "column" }}>
            <button className="btn-accent" onClick={() => setArabicMode(!arabicMode)} style={{ fontSize: "13px" }}>
              {arabicMode ? "English" : "العربية"}
            </button>
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: "8px 12px", 
                backgroundColor: "#dc3545", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              {arabicMode ? "تسجيل الخروج" : "Logout"}
            </button>
          </div>
        </aside>

        <section>
          <header className="topbar">
            <div>
              <h1>{arabicMode ? "نظام نقاط البيع" : "Building Materials POS"}</h1>
              <p>{arabicMode ? "مواد البناء - المبيعات والمخزون" : "Building Materials - Sales & Inventory"}</p>
            </div>
          </header>
          <main className="main-content">{children}</main>
          <section id="print-area" className="print-area">
            <div>{arabicMode ? "منطقة الطباعة" : "Print Area"}</div>
          </section>
        </section>
      </div>
    </div>
  );
}

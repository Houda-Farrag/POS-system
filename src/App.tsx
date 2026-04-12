import { Navigate, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardPage } from "./pages/DashboardPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { LoginPage } from "./pages/LoginPage";
import { PosPage } from "./pages/PosPage";
import { ProductsPage } from "./pages/ProductsPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { Layout } from "./components/Layout";
import { api } from "./api";
import type { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [arabicMode, setArabicMode] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore user session from main process
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const userPermissions = api.getPermissions(currentUser.role);
      setPermissions(userPermissions);
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    const userPermissions = api.getPermissions(loggedInUser.role);
    setPermissions(userPermissions);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setPermissions([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} arabicMode={arabicMode} setArabicMode={setArabicMode} />;
  }

  // Role-based route access control
  const can = (permission: string) => permissions.includes(permission);

  return (
    <Layout user={user} arabicMode={arabicMode} setArabicMode={setArabicMode} onLogout={handleLogout} permissions={permissions}>
      <Routes>
        <Route path="/" element={<Navigate to="/pos" replace />} />
        
        {can("invoices:create") && <Route path="/pos" element={<PosPage arabicMode={arabicMode} />} />}
        {can("products:read") && <Route path="/products" element={<ProductsPage arabicMode={arabicMode} />} />}
        {can("invoices:read") && <Route path="/invoices" element={<InvoicesPage arabicMode={arabicMode} />} />}
        {can("invoices:read") && <Route path="/dashboard" element={<DashboardPage arabicMode={arabicMode} />} />}
        
        {/* Admin only pages */}
        {can("users:read") && <Route path="/users" element={<UserManagementPage arabicMode={arabicMode} />} />}
        {can("audit:read") && <Route path="/audit" element={<AuditLogPage arabicMode={arabicMode} />} />}
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </Layout>
  );
}

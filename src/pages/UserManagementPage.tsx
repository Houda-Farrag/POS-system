import { useState, useEffect } from "react";
import { api } from "../api";
import type { User, UserCreateRequest } from "../types";

interface UserManagementPageProps {
  arabicMode: boolean;
}

interface EditingUser extends Partial<User> {
  newPassword?: string;
}

export function UserManagementPage({ arabicMode }: UserManagementPageProps) {
  const currentUser = api.getCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<{ [role: string]: string[] }>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<{ userId: number; role: string; permissions: string[] } | null>(null);

  const [formData, setFormData] = useState<UserCreateRequest>({
    username: "",
    password: "",
    email: "",
    role: "cashier",
    display_name: "",
  });

  const [editFormData, setEditFormData] = useState<EditingUser>({});

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  useEffect(() => {
    // Load permissions for each role
    roles.forEach((role) => {
      const perms = api.getPermissions(role.id);
      setPermissions((prev) => ({ ...prev, [role.id]: perms }));
    });
  }, [roles]);

  const loadUsers = () => {
    try {
      const userData = api.getUsers();
      setUsers(userData || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(arabicMode ? "خطأ في تحميل المستخدمين" : "Error loading users");
    }
  };

  const loadRoles = () => {
    try {
      const rolesData = api.getAllRoles();
      setRoles(rolesData || []);
    } catch (err) {
      console.error("Error loading roles:", err);
    }
  };

  const validateForm = (data: any, isEdit = false) => {
    if (!data.username?.trim()) {
      return arabicMode ? "يرجى إدخال اسم المستخدم" : "Username is required";
    }
    if (!isEdit && !data.password?.trim()) {
      return arabicMode ? "يرجى إدخال كلمة المرور" : "Password is required";
    }
    if (!data.email?.trim()) {
      return arabicMode ? "يرجى إدخال البريد الإلكتروني" : "Email is required";
    }
    if (!data.display_name?.trim()) {
      return arabicMode ? "يرجى إدخال اسم العرض" : "Display name is required";
    }
    if (data.password && data.password.length < 8) {
      return arabicMode ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters";
    }
    return null;
  };

  const handleCreateUser = async () => {
    setError("");
    setSuccess("");

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = api.createUser(formData);
      if (result.ok) {
        setSuccess(arabicMode ? "تم إنشاء المستخدم بنجاح" : "User created successfully");
        setFormData({ username: "", password: "", email: "", role: "cashier", display_name: "" });
        setShowForm(false);
        loadUsers();
      } else {
        setError(result.error || (arabicMode ? "خطأ في إنشاء المستخدم" : "Error creating user"));
      }
    } catch (err) {
      setError(arabicMode ? "خطأ في إنشاء المستخدم" : "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: number) => {
    setError("");
    setSuccess("");

    const validationError = validateForm(editFormData, true);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const updates: Partial<User> = {
        username: editFormData.username,
        email: editFormData.email,
        display_name: editFormData.display_name,
        role: editFormData.role as any,
      };

      const result = api.updateUser(userId, updates);
      if (result.ok) {
        setSuccess(arabicMode ? "تم تحديث المستخدم بنجاح" : "User updated successfully");
        setEditingUserId(null);
        setEditFormData({});
        loadUsers();
      } else {
        setError(result.error || (arabicMode ? "خطأ في تحديث المستخدم" : "Error updating user"));
      }
    } catch (err) {
      setError(arabicMode ? "خطأ في تحديث المستخدم" : "Error updating user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setError("");
    setSuccess("");

    if (userId === currentUser?.id) {
      setError(arabicMode ? "لا يمكنك حذف حسابك الخاص" : "You cannot delete your own account");
      return;
    }

    setLoading(true);
    try {
      const result = api.deleteUser(userId);
      if (result.ok) {
        setSuccess(arabicMode ? "تم حذف المستخدم بنجاح" : "User deleted successfully");
        setConfirmDelete(null);
        loadUsers();
      } else {
        setError(result.error || (arabicMode ? "خطأ في حذف المستخدم" : "Error deleting user"));
      }
    } catch (err) {
      setError(arabicMode ? "خطأ في حذف المستخدم" : "Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    setError("");
    setSuccess("");

    if (user.id === currentUser?.id) {
      setError(arabicMode ? "لا يمكنك تعطيل حسابك الخاص" : "You cannot deactivate your own account");
      return;
    }

    setLoading(true);
    try {
      const result = api.updateUser(user.id, { is_active: user.is_active ? 0 : 1 } as any);
      if (result.ok) {
        setSuccess(arabicMode ? "تم تحديث حالة المستخدم بنجاح" : "User status updated successfully");
        loadUsers();
      } else {
        setError(result.error || (arabicMode ? "خطأ في تحديث الحالة" : "Error updating user status"));
      }
    } catch (err) {
      setError(arabicMode ? "خطأ في تحديث الحالة" : "Error updating user status");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
    });
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  const getRoleLabel = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.label : roleId;
  };

  const getRoleDescription = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.description : "";
  };

  const showPermissions = (user: User) => {
    const perms = permissions[user.role] || [];
    setSelectedUserPermissions({
      userId: user.id,
      role: user.role,
      permissions: perms,
    });
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.75rem", color: "#2c3e50" }}>
          {arabicMode ? "👥 إدارة المستخدمين" : "👥 User Management"}
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
          {arabicMode ? "إنشاء وتحديث وحذف حسابات المستخدمين وإدارة الأدوار والصلاحيات" : "Create, update, and delete user accounts, manage roles and permissions"}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "#eff6ff", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
          <div style={{ fontSize: "0.75rem", color: "#3b82f6", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {arabicMode ? "إجمالي المستخدمين" : "Total Users"}
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2c3e50" }}>{users.length}</div>
        </div>
        <div style={{ background: "#f0fdf4", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "0.75rem", color: "#10b981", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {arabicMode ? "المستخدمون النشطون" : "Active Users"}
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2c3e50" }}>{users.filter((u) => u.is_active).length}</div>
        </div>
        <div style={{ background: "#fef3c7", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "0.75rem", color: "#f59e0b", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {arabicMode ? "الأدوار" : "Roles"}
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2c3e50" }}>{roles.length}</div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div style={{ padding: "0.75rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "1rem", border: "1px solid #fecaca" }}>
          ❌ {error}
        </div>
      )}
      {success && (
        <div style={{ padding: "0.75rem", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "8px", marginBottom: "1rem", border: "1px solid #bbf7d0" }}>
          ✅ {success}
        </div>
      )}

      {/* Add User Button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: showForm ? "#6b7280" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "600",
            transition: "all 0.2s",
          }}
        >
          {showForm ? (arabicMode ? "❌ إغلاق" : "❌ Close") : arabicMode ? "➕ إضافة مستخدم جديد" : "➕ Add New User"}
        </button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div style={{ backgroundColor: "#f9fafb", padding: "1.5rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#2c3e50" }}>
            {arabicMode ? "إنشاء مستخدم جديد" : "Create New User"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                {arabicMode ? "اسم المستخدم" : "Username"}
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={arabicMode ? "مثال: ahmed_123" : "e.g., john_doe"}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                {arabicMode ? "كلمة المرور" : "Password"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem" }}
              />
              <small style={{ display: "block", marginTop: "0.25rem", color: "#6b7280", fontSize: "0.75rem" }}>
                {arabicMode ? "8+ أحرف، حروف كبيرة وصغيرة وأرقام" : "Min 8 chars, uppercase, lowercase, numbers"}
              </small>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                {arabicMode ? "البريد الإلكتروني" : "Email"}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                {arabicMode ? "اسم العرض" : "Display Name"}
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder={arabicMode ? "مثال: أحمد محمد" : "e.g., John Doe"}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                {arabicMode ? "الدور" : "Role"}
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem" }}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleCreateUser}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontSize: "0.9rem",
              fontWeight: "600",
            }}
          >
            {loading ? (arabicMode ? "⏳ جاري الإضافة..." : "⏳ Adding...") : arabicMode ? "✓ إضافة المستخدم" : "✓ Create User"}
          </button>
        </div>
      )}

      {/* Users Table */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "1rem", textAlign: arabicMode ? "right" : "left", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                  {arabicMode ? "المستخدم" : "Username"}
                </th>
                <th style={{ padding: "1rem", textAlign: arabicMode ? "right" : "left", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                  {arabicMode ? "الاسم" : "Display Name"}
                </th>
                <th style={{ padding: "1rem", textAlign: arabicMode ? "right" : "left", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                  {arabicMode ? "البريد" : "Email"}
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                  {arabicMode ? "الدور" : "Role"}
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                  {arabicMode ? "الحالة" : "Status"}
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                  {arabicMode ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: editingUserId === user.id ? "#f9fafb" : "white" }}>
                  <td style={{ padding: "1rem" }}>
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editFormData.username || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    ) : (
                      <span style={{ fontWeight: "500", color: "#2c3e50" }}>{user.username}</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editFormData.display_name || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, display_name: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    ) : (
                      user.display_name
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {editingUserId === user.id ? (
                      <input
                        type="email"
                        value={editFormData.email || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    ) : (
                      <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>{user.email}</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    {editingUserId === user.id ? (
                      <select
                        value={editFormData.role || user.role}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                        style={{ padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.4rem 0.8rem",
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                          }}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.4rem 0.8rem",
                        backgroundColor: user.is_active ? "#d1fae5" : "#fee2e2",
                        color: user.is_active ? "#065f46" : "#991b1b",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                      }}
                    >
                      {user.is_active ? (arabicMode ? "✓ نشط" : "✓ Active") : arabicMode ? "✕ معطل" : "✕ Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                      {editingUserId === user.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateUser(user.id)}
                            disabled={loading}
                            title={arabicMode ? "حفظ" : "Save"}
                            style={{
                              padding: "0.4rem 0.8rem",
                              backgroundColor: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: loading ? "not-allowed" : "pointer",
                              fontSize: "0.75rem",
                              opacity: loading ? 0.6 : 1,
                            }}
                          >
                            ✓ {arabicMode ? "حفظ" : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            title={arabicMode ? "إلغاء" : "Cancel"}
                            style={{
                              padding: "0.4rem 0.8rem",
                              backgroundColor: "#6b7280",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                          >
                            ✕ {arabicMode ? "إلغاء" : "Cancel"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => showPermissions(user)}
                            title={arabicMode ? "عرض الصلاحيات" : "View Permissions"}
                            style={{
                              padding: "0.4rem 0.8rem",
                              backgroundColor: "#8b5cf6",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                          >
                            🔐 {arabicMode ? "صلاحيات" : "Perms"}
                          </button>
                          <button
                            onClick={() => startEdit(user)}
                            disabled={user.id === currentUser?.id}
                            title={arabicMode ? "تعديل" : "Edit"}
                            style={{
                              padding: "0.4rem 0.8rem",
                              backgroundColor: "#3b82f6",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: user.id === currentUser?.id ? "not-allowed" : "pointer",
                              fontSize: "0.75rem",
                              opacity: user.id === currentUser?.id ? 0.5 : 1,
                            }}
                          >
                            ✏️ {arabicMode ? "تعديل" : "Edit"}
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            disabled={user.id === currentUser?.id}
                            title={user.is_active ? (arabicMode ? "تعطيل" : "Deactivate") : arabicMode ? "تفعيل" : "Activate"}
                            style={{
                              padding: "0.4rem 0.8rem",
                              backgroundColor: user.is_active ? "#f59e0b" : "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: user.id === currentUser?.id ? "not-allowed" : "pointer",
                              fontSize: "0.75rem",
                              opacity: user.id === currentUser?.id ? 0.5 : 1,
                            }}
                          >
                            {user.is_active ? (arabicMode ? "🔒 تعطيل" : "🔒 Disable") : arabicMode ? "🔓 تفعيل" : "🔓 Enable"}
                          </button>
                          {confirmDelete === user.id ? (
                            <>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={loading}
                                title={arabicMode ? "تأكيد الحذف" : "Confirm Delete"}
                                style={{
                                  padding: "0.4rem 0.8rem",
                                  backgroundColor: "#dc2626",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: loading ? "not-allowed" : "pointer",
                                  fontSize: "0.75rem",
                                  opacity: loading ? 0.6 : 1,
                                }}
                              >
                                ✓ {arabicMode ? "تأكيد" : "Confirm"}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                title={arabicMode ? "إلغاء" : "Cancel"}
                                style={{
                                  padding: "0.4rem 0.8rem",
                                  backgroundColor: "#6b7280",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                }}
                              >
                                ✕ {arabicMode ? "إلغاء" : "Cancel"}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(user.id)}
                              disabled={user.id === currentUser?.id}
                              title={arabicMode ? "حذف" : "Delete"}
                              style={{
                                padding: "0.4rem 0.8rem",
                                backgroundColor: "#dc2626",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: user.id === currentUser?.id ? "not-allowed" : "pointer",
                                fontSize: "0.75rem",
                                opacity: user.id === currentUser?.id ? 0.5 : 1,
                              }}
                            >
                              🗑️ {arabicMode ? "حذف" : "Delete"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
            {arabicMode ? "📭 لا توجد مستخدمين بعد" : "📭 No users yet"}
          </div>
        )}
      </div>

      {/* Permissions Modal */}
      {selectedUserPermissions && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "#2c3e50" }}>
                {arabicMode ? "صلاحيات المستخدم" : "User Permissions"}
              </h3>
              <button
                onClick={() => setSelectedUserPermissions(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#6b7280" }}>
                {arabicMode ? "الدور:" : "Role:"} <strong>{getRoleLabel(selectedUserPermissions.role)}</strong>
              </p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#9ca3af" }}>
                {getRoleDescription(selectedUserPermissions.role)}
              </p>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", color: "#374151", fontSize: "0.9rem" }}>
                {arabicMode ? "الصلاحيات المتاحة:" : "Available Permissions:"}
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem" }}>
                {selectedUserPermissions.permissions.length > 0 ? (
                  selectedUserPermissions.permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        color: "#065f46",
                      }}
                    >
                      ✓ {perm}
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#999", fontSize: "0.9rem" }}>
                    {arabicMode ? "لا توجد صلاحيات محددة" : "No specific permissions"}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedUserPermissions(null)}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              {arabicMode ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

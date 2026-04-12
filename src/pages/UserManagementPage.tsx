import { useState, useEffect } from "react";
import { api } from "../api";
import type { User, UserCreateRequest } from "../types";

interface UserManagementPageProps {
  arabicMode: boolean;
}

export function UserManagementPage({ arabicMode }: UserManagementPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<UserCreateRequest>({
    username: "",
    password: "",
    email: "",
    role: "cashier",
    display_name: "",
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = () => {
    try {
      const userData = api.getUsers();
      setUsers(userData || []);
    } catch (err) {
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

  const handleCreateUser = async () => {
    setError("");
    setSuccess("");

    if (!formData.username || !formData.password || !formData.email || !formData.display_name) {
      setError(arabicMode ? "يرجى ملء جميع الحقول" : "Please fill all fields");
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

  const getRoleLabel = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.label : roleId;
  };

  return (
    <div className={arabicMode ? "rtl" : ""}>
      <h2>{arabicMode ? "إدارة المستخدمين" : "User Management"}</h2>

      <div style={{ marginBottom: "20px" }}>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? (arabicMode ? "إغلاق" : "Close") : arabicMode ? "إضافة مستخدم" : "Add User"}
        </button>
      </div>

      {error && <div style={{ padding: "10px", backgroundColor: "#fee", color: "#c33", borderRadius: "4px", marginBottom: "15px" }}>{error}</div>}
      {success && <div style={{ padding: "10px", backgroundColor: "#efe", color: "#3c3", borderRadius: "4px", marginBottom: "15px" }}>{success}</div>}

      {showForm && (
        <div style={{ backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "4px", marginBottom: "20px" }}>
          <div style={{ marginBottom: "15px" }}>
            <label>{arabicMode ? "اسم المستخدم" : "Username"}</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="username123"
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>{arabicMode ? "كلمة المرور" : "Password"}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
            <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
              {arabicMode ? "يجب أن تكون 8+ أحرف، بأحرف كبيرة وصغيرة وأرقام" : "Min 8 chars, uppercase, lowercase, numbers"}
            </small>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>{arabicMode ? "البريد الإلكتروني" : "Email"}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>{arabicMode ? "اسم العرض" : "Display Name"}</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>{arabicMode ? "الدور" : "Role"}</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-primary" onClick={handleCreateUser} disabled={loading}>
            {loading ? (arabicMode ? "جاري الإضافة..." : "Adding...") : arabicMode ? "إضافة المستخدم" : "Create User"}
          </button>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "10px", textAlign: arabicMode ? "right" : "left" }}>{arabicMode ? "المستخدم" : "Username"}</th>
              <th style={{ padding: "10px", textAlign: arabicMode ? "right" : "left" }}>{arabicMode ? "الاسم" : "Display Name"}</th>
              <th style={{ padding: "10px", textAlign: arabicMode ? "right" : "left" }}>{arabicMode ? "البريد" : "Email"}</th>
              <th style={{ padding: "10px", textAlign: arabicMode ? "right" : "left" }}>{arabicMode ? "الدور" : "Role"}</th>
              <th style={{ padding: "10px", textAlign: arabicMode ? "right" : "left" }}>{arabicMode ? "الحالة" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{user.username}</td>
                <td style={{ padding: "10px" }}>{user.display_name}</td>
                <td style={{ padding: "10px" }}>{user.email}</td>
                <td style={{ padding: "10px" }}>{getRoleLabel(user.role)}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{ padding: "2px 8px", backgroundColor: user.is_active ? "#efe" : "#fee", borderRadius: "3px", fontSize: "12px" }}>
                    {user.is_active ? (arabicMode ? "نشط" : "Active") : arabicMode ? "معطل" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && <p style={{ textAlign: "center", color: "#999", marginTop: "20px" }}>{arabicMode ? "لا توجد مستخدمين" : "No users"}</p>}
    </div>
  );
}

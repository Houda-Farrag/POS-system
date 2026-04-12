import { useState } from "react";
import { api } from "../api";
import type { User } from "../types";

interface LoginPageProps {
  onLogin: (user: User) => void;
  arabicMode: boolean;
  setArabicMode: (v: boolean) => void;
}

export function LoginPage({ onLogin, arabicMode, setArabicMode }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      setError(arabicMode ? "يرجى إدخال اسم المستخدم وكلمة المرور" : "Please enter username and password");
      return;
    }

    if (!api.isConnected()) {
      setError(
        arabicMode
          ? "لا يوجد اتصال مع Electron/SQLite. شغّل التطبيق عبر npm run electron:dev"
          : "Electron/SQLite bridge is not connected. Run app with: npm run electron:dev",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", { username, password });
      const user = api.login(username, password);
      console.log("Login API response:", { user });
      if (!user) {
        setError(arabicMode ? "بيانات الدخول غير صحيحة" : "Invalid username or password");
        setPassword("");
        return;
      }
      onLogin(user);
    } catch (err) {
      setError(arabicMode ? "حدث خطأ أثناء محاولة الدخول" : "An error occurred during login");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className={`login-screen ${arabicMode ? "font-arabic rtl" : ""}`}>
      <div className="card">
        <h2>{arabicMode ? "تسجيل الدخول" : "Login"}</h2>
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
          {arabicMode
            ? "استخدم: admin / accountant1 / cashier1"
            : "Demo users: admin / accountant1 / cashier1"}
        </p>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
            {arabicMode ? "اسم المستخدم" : "Username"}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={arabicMode ? "أدخل اسم المستخدم" : "Enter username"}
            disabled={loading}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
            {arabicMode ? "كلمة المرور" : "Password"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={arabicMode ? "أدخل كلمة المرور" : "Enter password"}
            disabled={loading}
          />
          <small style={{ display: "block", marginTop: "5px", color: "#999", fontSize: "12px" }}>
            {arabicMode
              ? "كل حسابات العرض: كلمة المرور هي '123456' (بدون علامات)"
              : "All demo accounts: password is '123456' (without quotes)"}
          </small>
        </div>

        {error && <div className="error-text" style={{ padding: "10px", backgroundColor: "#fee", borderRadius: "4px", marginBottom: "15px", color: "#c33" }}>{error}</div>}

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? (arabicMode ? "جاري الدخول..." : "Signing in...") : arabicMode ? "دخول" : "Sign In"}
        </button>

        <button className="btn-accent" onClick={() => setArabicMode(!arabicMode)} style={{ marginTop: "10px" }}>
          {arabicMode ? "English" : "العربية"}
        </button>
        {arabicMode ? (
          <p style={{ marginTop: "15px", fontSize: "11px", color: "#666" }}>
            {`تطبيق نقاط البيع Awlad Elsaman - الإصدار 1.0.0\nللمساعدة، اتصل بـ: support@awladelsaman.com`}
          </p>
        ) : (
          <p style={{ marginTop: "15px", fontSize: "11px", color: "#666" }}>
            {`Building Materials POS - Version 1.0.0\nFor assistance, contact: support@awladelsaman.com`}
          </p>
        )}

      </div>
    </div>
  );
}

import { useState } from "react";
import { T, gs } from "../../constants/tokens";
import { supabase } from "../../lib/supabase";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("signin"); // "signin" | "signup"

  const handleGoogle = async () => {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleEmailAuth = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    const { error: err } = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#667eea15 0%,#764ba215 50%,#f093fb10 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: T.accent, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 14, boxShadow: `0 8px 24px ${T.accent}40` }}>📋</div>
          <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: T.text }}>Reportly</h1>
          <p style={{ margin: 0, fontSize: 14, color: T.textSub }}>Your weekly narrative report, beautifully organized.</p>
        </div>

        <div style={{ background: T.surface, borderRadius: 18, padding: "28px 24px", boxShadow: T.shadowLg, border: `1px solid ${T.border}` }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: T.text }}>
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ margin: "0 0 22px", fontSize: 14, color: T.textSub }}>
            {mode === "signin" ? "Sign in to access your reports" : "Start tracking your work for free"}
          </p>

          {/* Google */}
          <button onClick={handleGoogle} style={{ ...gs.btn, width: "100%", padding: "13px", background: T.surface, border: `1.5px solid ${T.border}`, color: T.text, fontSize: 14, borderRadius: T.radius, boxShadow: T.shadow, marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ fontSize: 12, color: T.textMuted }}>or</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          {/* Email + Password */}
          <div style={{ marginBottom: 12 }}>
            <label style={gs.label}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={gs.input}
            />
          </div>
          <div style={{ marginBottom: error ? 10 : 18 }}>
            <label style={gs.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
              style={gs.input}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 14, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: T.radius, fontSize: 13, color: T.red, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleEmailAuth}
            disabled={loading}
            style={{ ...gs.btn, width: "100%", padding: "13px", background: loading ? T.border : T.accent, color: loading ? T.textSub : "#fff", fontSize: 14, borderRadius: T.radius }}
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: T.textMuted }}>
          {mode === "signin" ? "No account? " : "Already have an account? "}
          <span
            style={{ color: T.accent, cursor: "pointer", fontWeight: 600 }}
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
          >
            {mode === "signin" ? "Sign up free" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}
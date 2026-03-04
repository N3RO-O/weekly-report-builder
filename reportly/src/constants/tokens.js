export const T = {
  bg: "#f8f9fb", surface: "#ffffff", surfaceHover: "#f4f5f7", border: "#e4e7ec",
  accent: "#6366f1", accentSoft: "#eef2ff", accentText: "#4338ca",
  green: "#10b981", greenSoft: "#ecfdf5",
  red: "#ef4444", redSoft: "#fef2f2",
  yellow: "#f59e0b", yellowSoft: "#fffbeb",
  text: "#111827", textSub: "#6b7280", textMuted: "#9ca3af",
  radius: "10px", radiusLg: "14px",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08)",
  shadowLg: "0 20px 40px rgba(0,0,0,0.12)",
};

export const gs = {
  input: {
    width: "100%", padding: "10px 13px", background: T.surface,
    border: `1.5px solid ${T.border}`, borderRadius: T.radius,
    fontSize: "15px", color: T.text, outline: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s", WebkitAppearance: "none",
  },
  textarea: {
    width: "100%", padding: "10px 13px", background: T.surface,
    border: `1.5px solid ${T.border}`, borderRadius: T.radius,
    fontSize: "15px", color: T.text, outline: "none", resize: "vertical",
    fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.6,
    boxSizing: "border-box", minHeight: "80px",
  },
  label: {
    display: "block", fontSize: "12px", fontWeight: 600,
    color: T.textSub, marginBottom: "5px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  btn: {
    padding: "10px 16px", borderRadius: T.radius, fontSize: "14px",
    fontWeight: 600, cursor: "pointer", border: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: "6px", WebkitTapHighlightColor: "transparent",
  },
};

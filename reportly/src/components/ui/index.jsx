import { T, gs } from "../../constants/tokens";

export function Badge({ children, color = T.accent }) {
  return (
    <span style={{ padding: "2px 10px", background: color + "18", color, border: `1px solid ${color}28`, borderRadius: "999px", fontSize: "11px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export function Avatar({ name, size = 32 }) {
  const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0 }}>
      {name[0].toUpperCase()}
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ width: 16, height: 16, border: `2px solid ${T.border}`, borderTop: `2px solid ${T.accent}`, borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />
  );
}

export function SaveStatus({ status }) {
  const map = {
    saving: { icon: <Spinner />, text: "Saving…", color: T.textMuted },
    saved: { icon: "✓", text: "Saved", color: T.green },
    error: { icon: "✕", text: "Error", color: T.red },
    idle: { icon: null, text: null },
  };
  const s = map[status];
  if (!s.text) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "12px", color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>
      {s.icon}{s.text}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 520, boxShadow: T.shadowLg, overflow: "hidden", animation: "slideUp 0.25s ease" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: "16px", fontFamily: "'Plus Jakarta Sans', sans-serif", color: T.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 24, lineHeight: 1, padding: "4px 8px" }}>×</button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

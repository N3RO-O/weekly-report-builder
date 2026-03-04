import { useState } from "react";
import { T, gs } from "../../constants/tokens";
import { Avatar, Modal } from "../ui";
import { ReportCard } from "./ReportCard";
import { useIsMobile } from "../../hooks/useIsMobile";

export function Dashboard({ user, reports, onOpen, onCreate, onDelete, onRename }) {
  const isMobile = useIsMobile();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const total = reports.reduce((s, r) => s + r.totalHours, 0);
  const totalWeeks = reports.reduce((s, r) => s + r.weekCount, 0);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: `0 ${isMobile ? "16px" : "28px"}`, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: T.accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📋</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: T.text }}>Reportly</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={user.name} size={30} />
          {!isMobile && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{user.name}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{user.email}</div>
            </div>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? "18px 14px" : "36px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, gap: 12 }}>
          <div>
            <h1 style={{ margin: "0 0 2px", fontSize: isMobile ? 21 : 26, fontWeight: 800, color: T.text }}>My Reports</h1>
            <p style={{ margin: 0, fontSize: 13, color: T.textSub }}>All your weekly narrative reports</p>
          </div>
          <button onClick={onCreate} style={{ ...gs.btn, background: T.accent, color: "#fff", padding: "10px 16px", fontSize: 14, boxShadow: `0 4px 12px ${T.accent}40`, whiteSpace: "nowrap", flexShrink: 0 }}>
            + New
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isMobile ? 10 : 14, marginBottom: 26 }}>
          {[["Reports", reports.length, "📁"], ["Weeks", totalWeeks, "📅"], ["Hours", `${total}h`, "⏱"]].map(([l, v, icon]) => (
            <div key={l} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: isMobile ? "12px 10px" : "18px 20px", boxShadow: T.shadow }}>
              <div style={{ fontSize: isMobile ? 16 : 20, marginBottom: 5 }}>{icon}</div>
              <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: T.text, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 11, color: T.textSub, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Report grid */}
        {reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: T.surface, borderRadius: T.radiusLg, border: `2px dashed ${T.border}` }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
            <h3 style={{ margin: "0 0 8px", color: T.text }}>No reports yet</h3>
            <p style={{ margin: "0 0 18px", color: T.textSub, fontSize: 14 }}>Create your first report to get started</p>
            <button onClick={onCreate} style={{ ...gs.btn, background: T.accent, color: "#fff", padding: "11px 24px" }}>Create Report</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {reports.map(r => (
              <ReportCard
                key={r.id}
                report={r}
                onOpen={onOpen}
                onShare={setShareModal}
                onRename={onRename}
                onDelete={setDeleteConfirm}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Report">
        <p style={{ margin: "0 0 18px", fontSize: 14, color: T.textSub }}>Delete <strong>"{deleteConfirm?.title}"</strong>? This can't be undone.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setDeleteConfirm(null)} style={{ ...gs.btn, flex: 1, background: T.surfaceHover, color: T.textSub, border: `1px solid ${T.border}` }}>Cancel</button>
          <button onClick={() => { onDelete(deleteConfirm.id); setDeleteConfirm(null); }} style={{ ...gs.btn, flex: 1, background: T.red, color: "#fff" }}>Delete</button>
        </div>
      </Modal>

      {/* Share modal */}
      <Modal open={!!shareModal} onClose={() => { setShareModal(null); setCopied(false); }} title="Share Report">
        <p style={{ margin: "0 0 12px", fontSize: 14, color: T.textSub }}>Anyone with this link can view your report.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input readOnly value={`https://reportly.app/share/${shareModal?.shareId}`} style={{ ...gs.input, background: T.bg, color: T.textSub, fontSize: 13 }} />
          <button
            onClick={() => { navigator.clipboard?.writeText(`https://reportly.app/share/${shareModal?.shareId}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ ...gs.btn, background: copied ? T.greenSoft : T.accent, color: copied ? T.green : "#fff", width: "100%", padding: "13px" }}
          >
            {copied ? "✓ Link Copied!" : "Copy Share Link"}
          </button>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: T.textMuted }}>🔒 Viewers cannot edit your report.</p>
      </Modal>
    </div>
  );
}

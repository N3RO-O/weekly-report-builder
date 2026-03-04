import { useState } from "react";
import { T, gs } from "../../constants/tokens";
import { Avatar, Modal } from "../ui";
import { ReportCard } from "./ReportCard";
import { useIsMobile } from "../../hooks/useIsMobile";
import { supabase } from "../../lib/supabase";

export function Dashboard({ user, reports, loading, onOpen, onCreate, onDelete, onRename }) {
  const isMobile = useIsMobile();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const total = reports.reduce((s, r) => s + r.total_hours, 0);
  const totalWeeks = reports.reduce((s, r) => s + r.week_count, 0);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    // onAuthStateChange in App.jsx handles the rest
  };

  // Derive display name from Supabase user object
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const displayEmail = user.email || "";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: `0 ${isMobile ? "16px" : "28px"}`, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: T.accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📋</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: T.text }}>Reportly</span>
        </div>

        {/* User menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            style={{ ...gs.btn, background: "transparent", border: "none", padding: "6px 8px", gap: 8, borderRadius: T.radius }}
          >
            <Avatar name={displayName} size={30} />
            {!isMobile && (
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{displayName}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{displayEmail}</div>
              </div>
            )}
            <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 2 }}>▾</span>
          </button>

          {userMenuOpen && (
            <>
              {/* Backdrop */}
              <div onClick={() => setUserMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 150 }} />

              {/* Dropdown */}
              <div style={{ position: "absolute", right: 0, top: "110%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, boxShadow: T.shadowMd, zIndex: 200, minWidth: 200, overflow: "hidden" }}>
                {/* User info header */}
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{displayName}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{displayEmail}</div>
                </div>

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  style={{ ...gs.btn, width: "100%", justifyContent: "flex-start", borderRadius: 0, background: "transparent", color: signingOut ? T.textMuted : T.red, padding: "12px 16px", fontSize: 14, border: "none", gap: 8 }}
                >
                  {signingOut ? "Signing out…" : "← Sign Out"}
                </button>
              </div>
            </>
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
        {loading ? (
          // Loading skeleton
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "18px", boxShadow: T.shadow }}>
                <div style={{ width: 36, height: 36, background: T.border, borderRadius: 10, marginBottom: 14, animation: "pulse 1.5s ease infinite" }} />
                <div style={{ height: 16, background: T.border, borderRadius: 6, marginBottom: 10, width: "70%", animation: "pulse 1.5s ease infinite" }} />
                <div style={{ height: 12, background: T.border, borderRadius: 6, width: "40%", animation: "pulse 1.5s ease infinite" }} />
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
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

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
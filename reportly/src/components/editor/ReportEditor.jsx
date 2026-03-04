import { useState } from "react";
import { T, gs } from "../../constants/tokens";
import { SaveStatus, Modal } from "../ui";
import { WeekEditor } from "./WeekEditor";
import { AISummaryPanel } from "../ai/AISummaryPanel";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useAutoSave } from "../../hooks/useAutoSave";
import { DEFAULT_WEEK } from "../../constants/defaults";
import { totalHours } from "../../lib/helpers";
import { exportReportPDF } from "../../lib/pdf";

export function ReportEditor({ report, onBack, onUpdate, user }) {
  const isMobile = useIsMobile();
  const [showAI, setShowAI] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { save, status: saveStatus } = useAutoSave(onUpdate);

  const updateReport = (changes) => {
    const updated = { ...report, ...changes, updatedAt: new Date().toISOString().slice(0, 10) };
    onUpdate(updated);
    save(updated);
  };

  const updateWeek = (i, w) => { const weeks = [...report.weeks]; weeks[i] = w; updateReport({ weeks }); };
  const addWeek = () => updateReport({ weeks: [...report.weeks, DEFAULT_WEEK(report.weeks.length + 1)] });
  const removeWeek = (i) => updateReport({ weeks: report.weeks.filter((_, j) => j !== i) });

  const total = totalHours(report.weeks);
  const totalDays = report.weeks.reduce((s, w) => s + w.days.filter(d => !d.isHoliday).length, 0);

  const menuItems = [
    { label: "✦ AI Summary", action: () => setShowAI(v => !v) },
    { label: "↗ Share", action: () => setShareModal(true) },
    { label: "📄 Export PDF", action: () => exportReportPDF(report, user) },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Topbar */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: `0 ${isMobile ? "14px" : "24px"}`, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <button onClick={onBack} style={{ ...gs.btn, background: T.surfaceHover, color: T.textSub, border: `1px solid ${T.border}`, padding: "7px 11px", fontSize: 16, flexShrink: 0 }}>←</button>
          <input
            value={report.title}
            onChange={e => updateReport({ title: e.target.value })}
            style={{ border: "none", outline: "none", fontWeight: 700, fontSize: isMobile ? 13 : 15, color: T.text, background: "transparent", fontFamily: "'Plus Jakarta Sans', sans-serif", width: "100%", minWidth: 0 }}
          />
          {!isMobile && <SaveStatus status={saveStatus} />}
        </div>

        {!isMobile && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <button onClick={() => setShowAI(v => !v)} style={{ ...gs.btn, background: showAI ? T.accentSoft : T.surfaceHover, color: showAI ? T.accentText : T.textSub, border: `1px solid ${showAI ? T.accent + "40" : T.border}`, fontSize: 13 }}>✦ AI</button>
            <button onClick={() => setShareModal(true)} style={{ ...gs.btn, background: T.surfaceHover, color: T.textSub, border: `1px solid ${T.border}`, fontSize: 13 }}>↗ Share</button>
            <button onClick={() => exportReportPDF(report, user)} style={{ ...gs.btn, background: T.accent, color: "#fff", fontSize: 13, boxShadow: `0 2px 8px ${T.accent}40` }}>📄 Export PDF</button>
          </div>
        )}

        {isMobile && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button onClick={() => setMenuOpen(v => !v)} style={{ ...gs.btn, background: T.surfaceHover, color: T.text, border: `1px solid ${T.border}`, padding: "8px 13px", fontSize: 18 }}>⋯</button>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 150 }} />
                <div style={{ position: "absolute", right: 0, top: "110%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, boxShadow: T.shadowMd, zIndex: 200, minWidth: 180, overflow: "hidden" }}>
                  {menuItems.map((item, i, arr) => (
                    <button key={item.label} onClick={() => { item.action(); setMenuOpen(false); }} style={{ ...gs.btn, width: "100%", justifyContent: "flex-start", borderRadius: 0, background: "transparent", color: T.text, padding: "13px 18px", fontSize: 14, border: "none", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "14px 14px 100px" : "28px 24px" }}>
        {isMobile && saveStatus !== "idle" && <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><SaveStatus status={saveStatus} /></div>}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: isMobile ? 8 : 10, marginBottom: 18 }}>
          {[["Hours", `${total}h`], ["Days", totalDays], ["Weeks", report.weeks.length], ["Avg", report.weeks.length ? `${Math.round(total / report.weeks.length)}h` : "—"]].map(([l, v]) => (
            <div key={l} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: isMobile ? "10px 8px" : "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: T.accent }}>{v}</div>
            </div>
          ))}
        </div>

        {showAI && <AISummaryPanel report={report} targetWeek={report.weeks.length - 1} />}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text }}>Weekly Log</h2>
          <button onClick={addWeek} style={{ ...gs.btn, background: T.accent, color: "#fff", fontSize: 13, padding: "8px 14px" }}>+ Week</button>
        </div>

        {report.weeks.map((week, i) => (
          <WeekEditor key={week.id || i} week={week} onChange={w => updateWeek(i, w)} onRemove={() => removeWeek(i)} />
        ))}
      </div>

      {/* Mobile sticky bottom */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.surface, borderTop: `1px solid ${T.border}`, padding: "10px 14px", display: "flex", gap: 8, zIndex: 99, paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
          <button onClick={() => setShowAI(v => !v)} style={{ ...gs.btn, flex: 1, background: showAI ? T.accentSoft : T.surfaceHover, color: showAI ? T.accentText : T.textSub, border: `1px solid ${showAI ? T.accent + "40" : T.border}`, fontSize: 13, padding: "12px" }}>✦ AI</button>
          <button onClick={() => exportReportPDF(report, user)} style={{ ...gs.btn, flex: 2, background: T.accent, color: "#fff", padding: "12px", fontSize: 14 }}>📄 Export PDF</button>
          <button onClick={() => setShareModal(true)} style={{ ...gs.btn, flex: 1, background: T.surfaceHover, color: T.text, border: `1px solid ${T.border}`, padding: "12px", fontSize: 13 }}>↗</button>
        </div>
      )}

      <Modal open={shareModal} onClose={() => { setShareModal(false); setCopied(false); }} title="Share Report">
        <p style={{ margin: "0 0 12px", fontSize: 14, color: T.textSub }}>Share a read-only link to this report.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input readOnly value={`https://reportly.app/share/${report.shareId}`} style={{ ...gs.input, background: T.bg, fontSize: 13 }} />
          <button onClick={() => { navigator.clipboard?.writeText(`https://reportly.app/share/${report.shareId}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ ...gs.btn, background: copied ? T.greenSoft : T.accent, color: copied ? T.green : "#fff", width: "100%", padding: "13px" }}>
            {copied ? "✓ Link Copied!" : "Copy Share Link"}
          </button>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: T.textMuted }}>🔒 Viewers cannot edit your report.</p>
      </Modal>
    </div>
  );
}

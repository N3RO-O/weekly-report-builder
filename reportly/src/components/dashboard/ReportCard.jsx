import { useState } from "react";
import { T, gs } from "../../constants/tokens";
import { Badge } from "../ui";
import { timeAgo } from "../../lib/helpers";

export function ReportCard({ report, onOpen, onShare, onRename, onDelete }) {
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(report.title);

  const commitRename = () => {
    onRename(report.id, renameVal);
    setRenaming(false);
  };

  return (
    <div
      onClick={() => !renaming && onOpen(report.id)}
      style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "18px", cursor: "pointer", transition: "all 0.15s", boxShadow: T.shadow }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadow; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, background: T.accentSoft, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📄</div>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onShare(report)} style={{ ...gs.btn, padding: "6px 10px", background: T.surfaceHover, color: T.textSub, border: `1px solid ${T.border}`, fontSize: 13 }}>↗</button>
          <button onClick={() => { setRenaming(true); setRenameVal(report.title); }} style={{ ...gs.btn, padding: "6px 10px", background: T.surfaceHover, color: T.textSub, border: `1px solid ${T.border}`, fontSize: 13 }}>✏️</button>
          <button onClick={() => onDelete(report)} style={{ ...gs.btn, padding: "6px 10px", background: T.redSoft, color: T.red, border: `1px solid ${T.red}20`, fontSize: 13 }}>🗑</button>
        </div>
      </div>

      {renaming ? (
        <input
          autoFocus value={renameVal}
          onChange={e => setRenameVal(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(false); }}
          style={{ ...gs.input, marginBottom: 10, fontWeight: 700 }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{report.title}</h3>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        <Badge color={T.accent}>{report.weekCount} weeks</Badge>
        <Badge color={T.green}>{report.totalHours}h logged</Badge>
      </div>
      <div style={{ fontSize: 12, color: T.textMuted }}>Updated {timeAgo(report.updatedAt)}</div>
    </div>
  );
}

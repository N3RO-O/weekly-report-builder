import { useState } from "react";
import { T, gs } from "../../constants/tokens";
import { Spinner } from "../ui";
import { formatDate, getDayName, weekHours } from "../../lib/helpers";

export function AISummaryPanel({ report, targetWeek }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [scope, setScope] = useState("overall");

  const generate = async () => {
    setLoading(true); setError(""); setSummary("");
    try {
      const weeks = scope === "overall" ? report.weeks : [report.weeks[targetWeek]].filter(Boolean);
      const context = weeks.map(w => {
        const days = w.days.map(d =>
          d.isHoliday
            ? `- Holiday: ${d.holidayName || "No work"}`
            : `- ${getDayName(d.date) || "Day"} (${d.hoursWorked}h): ${d.tasks.filter(t => t.trim()).join("; ")}. ${d.experiences || ""}`
        ).join("\n");
        return `Week #${w.weekNumber} (${formatDate(w.startDate)} – ${formatDate(w.endDate)}, ${weekHours(w)}h):\n${days}\nSummary: ${w.summary}\nChallenges: ${w.challenges}\nSkills: ${w.skills}\nLessons: ${w.lessons}`;
      }).join("\n\n");

      const prompt = scope === "overall"
        ? `You are a professional report writer. Based on this internship/work log, write a polished, concise overall summary paragraph (3–5 sentences) highlighting key accomplishments, growth areas, and overall contribution. Be specific and professional.\n\n${context}`
        : `You are a professional report writer. Based on this single week's log, write a clear weekly summary (2–4 sentences) covering what was accomplished, what was learned, and any challenges. Be specific.\n\n${context}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      setSummary(data.content?.[0]?.text || "No response.");
    } catch {
      setError("Failed to generate. Check your connection.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: "linear-gradient(135deg,#eef2ff 0%,#f0fdf4 100%)", border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: "18px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, background: T.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✦</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Summary Generator</div>
          <div style={{ fontSize: 12, color: T.textSub, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Generate a polished summary from your logs</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["overall", "weekly"].map(opt => (
          <button key={opt} onClick={() => setScope(opt)} style={{ ...gs.btn, padding: "8px 14px", background: scope === opt ? T.accent : T.surface, color: scope === opt ? "#fff" : T.textSub, border: `1.5px solid ${scope === opt ? T.accent : T.border}`, fontSize: 13, flex: 1 }}>
            {opt === "overall" ? "🗂 Overall" : "📅 This Week"}
          </button>
        ))}
      </div>
      <button onClick={generate} disabled={loading} style={{ ...gs.btn, background: loading ? T.border : T.accent, color: loading ? T.textSub : "#fff", width: "100%", padding: "12px" }}>
        {loading ? <><Spinner /> Generating…</> : "✦ Generate Summary"}
      </button>
      {error && <p style={{ marginTop: 12, fontSize: 13, color: T.red, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{error}</p>}
      {summary && (
        <div style={{ marginTop: 14, padding: "14px", background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.accent, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Generated Summary</span>
            <button onClick={() => navigator.clipboard?.writeText(summary)} style={{ ...gs.btn, padding: "5px 12px", background: T.accentSoft, color: T.accentText, fontSize: 12 }}>Copy</button>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{summary}</p>
        </div>
      )}
    </div>
  );
}

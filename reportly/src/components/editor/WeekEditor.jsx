import { T, gs } from "../../constants/tokens";
import { Badge } from "../ui";
import { useIsMobile } from "../../hooks/useIsMobile";
import { DEFAULT_DAY } from "../../constants/defaults";
import { formatDate, getDayName } from "../../lib/helpers";

// ─── DAY EDITOR ───────────────────────────────────────────────────────────────
export function DayEditor({ day, dayIndex, onChange, onRemove }) {
  const isMobile = useIsMobile();
  const u = (f, v) => onChange({ ...day, [f]: v });
  const dayName = getDayName(day.date) || `Day ${dayIndex + 1}`;

  return (
    <div style={{ border: `1.5px solid ${day.isHoliday ? T.yellow + "80" : T.border}`, borderLeft: `4px solid ${day.isHoliday ? T.yellow : T.accent}`, borderRadius: T.radius, padding: "16px", marginBottom: 10, background: day.isHoliday ? T.yellowSoft : T.surface }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{dayName}</span>
          {day.date && !isMobile && <span style={{ fontSize: 12, color: T.textSub }}>{formatDate(day.date)}</span>}
          {day.isHoliday && <Badge color={T.yellow}>Holiday</Badge>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.textSub, cursor: "pointer", whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={day.isHoliday} onChange={e => u("isHoliday", e.target.checked)} style={{ accentColor: T.yellow, width: 16, height: 16 }} />
            {!isMobile && "Holiday"}
          </label>
          <button onClick={onRemove} style={{ ...gs.btn, padding: "6px 10px", background: T.redSoft, color: T.red, border: `1px solid ${T.red}20`, fontSize: 13 }}>✕</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div><label style={gs.label}>Date</label><input type="date" value={day.date} onChange={e => u("date", e.target.value)} style={gs.input} /></div>
        <div>
          <label style={gs.label}>Hours Worked</label>
          <input type="number" min={0} max={24} step={0.5} value={day.isHoliday ? 0 : day.hoursWorked} disabled={day.isHoliday} onChange={e => u("hoursWorked", e.target.value)} style={{ ...gs.input, background: day.isHoliday ? T.bg : T.surface }} />
        </div>
      </div>

      {day.isHoliday ? (
        <div><label style={gs.label}>Holiday Name</label><input value={day.holidayName} onChange={e => u("holidayName", e.target.value)} placeholder="e.g. Chinese New Year" style={gs.input} /></div>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={gs.label}>Key Tasks & Responsibilities</label>
            {day.tasks.map((task, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <input value={task} onChange={e => { const t = [...day.tasks]; t[i] = e.target.value; onChange({ ...day, tasks: t }); }} placeholder={`Task ${i + 1}…`} style={{ ...gs.input, marginBottom: 0 }} />
                {day.tasks.length > 1 && <button onClick={() => onChange({ ...day, tasks: day.tasks.filter((_, j) => j !== i) })} style={{ ...gs.btn, padding: "8px 12px", background: T.redSoft, color: T.red, border: "none", flexShrink: 0 }}>✕</button>}
              </div>
            ))}
            <button onClick={() => onChange({ ...day, tasks: [...day.tasks, ""] })} style={{ ...gs.btn, background: T.accentSoft, color: T.accentText, marginTop: 4, fontSize: 13, padding: "8px 14px" }}>+ Task</button>
          </div>
          <div>
            <label style={gs.label}>Experiences & Reflections</label>
            <textarea value={day.experiences} onChange={e => u("experiences", e.target.value)} placeholder="What did you learn today?" style={{ ...gs.textarea, minHeight: 72 }} rows={3} />
          </div>
        </>
      )}
    </div>
  );
}

// ─── WEEK EDITOR ──────────────────────────────────────────────────────────────
export function WeekEditor({ week, onChange, onRemove }) {
  const isMobile = useIsMobile();
  const u = (f, v) => onChange({ ...week, [f]: v });
  const updateDay = (i, d) => { const days = [...week.days]; days[i] = d; onChange({ ...week, days }); };
  const wh = week.days.reduce((s, d) => s + (d.isHoliday ? 0 : Number(d.hoursWorked) || 0), 0);

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: isMobile ? "14px" : "22px", marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, background: T.accentSoft, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: T.accentText, flexShrink: 0 }}>W{week.weekNumber}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Week #{week.weekNumber}</div>
            <div style={{ fontSize: 12, color: T.textSub }}>
              {week.startDate && week.endDate ? `${formatDate(week.startDate)} – ${formatDate(week.endDate)}` : "Set dates"} · <span style={{ color: T.accent, fontWeight: 600 }}>{wh}h</span>
            </div>
          </div>
        </div>
        <button onClick={onRemove} style={{ ...gs.btn, background: T.redSoft, color: T.red, border: `1px solid ${T.red}20`, fontSize: 12, padding: "7px 12px", flexShrink: 0 }}>✕</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div><label style={gs.label}>Week #</label><input type="number" min={1} value={week.weekNumber} onChange={e => u("weekNumber", e.target.value)} style={gs.input} /></div>
        <div><label style={gs.label}>Start Date</label><input type="date" value={week.startDate} onChange={e => u("startDate", e.target.value)} style={gs.input} /></div>
        <div><label style={gs.label}>End Date</label><input type="date" value={week.endDate} onChange={e => u("endDate", e.target.value)} style={gs.input} /></div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.08em" }}>Daily Log</span>
          <button onClick={() => onChange({ ...week, days: [...week.days, DEFAULT_DAY()] })} style={{ ...gs.btn, background: T.accent, color: "#fff", fontSize: 13, padding: "7px 14px" }}>+ Day</button>
        </div>
        {week.days.map((day, i) => (
          <DayEditor key={day.id || i} day={day} dayIndex={i} onChange={d => updateDay(i, d)} onRemove={() => onChange({ ...week, days: week.days.filter((_, j) => j !== i) })} />
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Weekly Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          {[["summary", "Summary", "Overall accomplishment?"], ["challenges", "Challenges", "What was hard?"], ["skills", "Skills Improved", "What did you develop?"], ["lessons", "Lessons Learned", "What will you carry forward?"]].map(([f, l, ph]) => (
            <div key={f}><label style={gs.label}>{l}</label><textarea value={week[f]} onChange={e => u(f, e.target.value)} placeholder={ph} style={{ ...gs.textarea, minHeight: 70 }} rows={3} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

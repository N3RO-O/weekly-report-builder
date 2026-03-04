import { useState, useCallback, useRef } from "react";

// jsPDF loaded via CDN in the script tag below
// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS_PER_DAY = 8;

const DEFAULT_DAY = () => ({
  date: "", isHoliday: false, holidayName: "",
  tasks: [""], experiences: "", hoursWorked: HOURS_PER_DAY,
});

const DEFAULT_WEEK = () => ({
  weekNumber: 1, startDate: "", endDate: "",
  days: [DEFAULT_DAY()],
  summary: "", challenges: "", skills: "", lessons: "",
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function getDayName(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return DAYS_OF_WEEK[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function totalHours(weeks) {
  return weeks.reduce((sum, w) =>
    sum + w.days.reduce((s, d) => s + (d.isHoliday ? 0 : Number(d.hoursWorked) || 0), 0), 0);
}

function weekHours(week) {
  return week.days.reduce((s, d) => s + (d.isHoliday ? 0 : Number(d.hoursWorked) || 0), 0);
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────

function buildFullPDF(reporterName, organization, position, weeks) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ML = 50, MR = 50, pageW = W - ML - MR;
  let y = 0;

  const newPage = () => { doc.addPage(); y = 50; };
  const checkPage = (needed = 40) => { if (y + needed > H - 50) newPage(); };

  const setFont = (style = "normal", size = 11, color = [26, 26, 26]) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const text = (str, x, yy, opts = {}) => doc.text(str, x, yy, opts);

  const wrapText = (str, maxW, size = 11) => {
    setFont("normal", size);
    return doc.splitTextToSize(str || "", maxW);
  };

  // ── Cover header ──
  doc.setFillColor(45, 74, 62);
  doc.rect(0, 0, W, 110, "F");
  setFont("bold", 9, [255, 255, 255]);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("WEEKLY NARRATIVE REPORT", ML, 30);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(reporterName || "Reporter Name", ML, 58);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${position}${organization ? "  ·  " + organization : ""}`, ML, 76);

  // Stats row
  const total = totalHours(weeks);
  const totalDays = weeks.reduce((s, w) => s + w.days.filter(d => !d.isHoliday).length, 0);
  const stats = [
    ["TOTAL HOURS", `${total} hrs`],
    ["TOTAL WEEKS", `${weeks.length}`],
    ["WORK DAYS", `${totalDays}`],
    ["AVG / WEEK", `${weeks.length ? Math.round(total / weeks.length) : 0} hrs`],
  ];
  stats.forEach(([label, val], i) => {
    const x = ML + i * 120;
    doc.setFontSize(8); doc.setTextColor(160, 200, 180); doc.text(label, x, 96);
    doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text(val, x, 108);
  });

  y = 140;

  // ── Each week ──
  weeks.forEach((week, wi) => {
    if (wi > 0) newPage();
    const wh = weekHours(week);

    // Week header bar
    checkPage(50);
    doc.setFillColor(234, 230, 224);
    doc.rect(ML, y - 14, pageW, 26, "F");
    setFont("bold", 13, [45, 74, 62]);
    doc.text(`Week #${week.weekNumber}`, ML + 10, y + 5);
    if (week.startDate && week.endDate) {
      setFont("normal", 9, [122, 112, 104]);
      doc.text(`${formatDate(week.startDate)} – ${formatDate(week.endDate)}`, ML + 10, y + 17);
    }
    setFont("bold", 13, [45, 74, 62]);
    doc.text(`${wh} hrs`, W - MR - 10, y + 5, { align: "right" });
    y += 32;

    // Days
    week.days.forEach((day, di) => {
      checkPage(60);
      const dayName = getDayName(day.date);
      const dayLabel = `Day ${di + 1}${dayName ? ` (${dayName})` : ""}${day.date ? " — " + formatDate(day.date) : ""}`;

      // Day heading
      setFont("bold", 11, [45, 74, 62]);
      doc.text(dayLabel + ":", ML, y);
      if (!day.isHoliday) {
        setFont("normal", 9, [122, 112, 104]);
        doc.text(`${day.hoursWorked} hrs`, W - MR, y, { align: "right" });
      }
      y += 16;

      if (day.isHoliday) {
        setFont("italic", 10, [122, 112, 104]);
        doc.text(`🗓 Holiday${day.holidayName ? " — " + day.holidayName : " — No work required."}`, ML + 10, y);
        y += 20;
        return;
      }

      // Tasks
      const activeTasks = day.tasks.filter(t => t.trim());
      if (activeTasks.length) {
        setFont("bold", 8, [122, 112, 104]);
        doc.text("KEY TASKS & RESPONSIBILITIES:", ML, y);
        y += 13;
        activeTasks.forEach(task => {
          const lines = wrapText("• " + task, pageW - 20);
          checkPage(lines.length * 14 + 6);
          setFont("normal", 10, [26, 26, 26]);
          doc.text(lines, ML + 10, y);
          y += lines.length * 14;
        });
        y += 4;
      }

      // Experiences
      if (day.experiences?.trim()) {
        checkPage(30);
        setFont("bold", 8, [122, 112, 104]);
        doc.text("EXPERIENCES:", ML, y); y += 13;
        const lines = wrapText(day.experiences, pageW - 10);
        checkPage(lines.length * 14 + 6);
        setFont("normal", 10, [26, 26, 26]);
        doc.text(lines, ML + 10, y);
        y += lines.length * 14 + 8;
      }

      // Divider
      doc.setDrawColor(226, 221, 214);
      doc.line(ML, y, W - MR, y);
      y += 14;
    });

    // Weekly summary section
    const summaryFields = [
      ["SUMMARY", week.summary],
      ["CHALLENGES & HOW ADDRESSED", week.challenges],
      ["SKILLS IMPROVED", week.skills],
      ["LESSONS LEARNED", week.lessons],
    ].filter(([, v]) => v?.trim());

    if (summaryFields.length) {
      checkPage(30);
      doc.setFillColor(245, 242, 237);
      doc.rect(ML, y - 10, pageW, 22, "F");
      setFont("bold", 10, [45, 74, 62]);
      doc.text("WEEKLY SUMMARY", ML + 10, y + 5);
      y += 22;

      summaryFields.forEach(([label, val]) => {
        const lines = wrapText(val, pageW - 20);
        checkPage(lines.length * 14 + 30);
        setFont("bold", 8, [122, 112, 104]);
        doc.text(label + ":", ML, y); y += 13;
        setFont("normal", 10, [26, 26, 26]);
        doc.text(lines, ML + 10, y);
        y += lines.length * 14 + 10;
      });
    }
  });

  // Page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    setFont("normal", 8, [180, 170, 160]);
    doc.text(`${reporterName} — Weekly Narrative Report`, ML, H - 20);
    doc.text(`${i} / ${pageCount}`, W - MR, H - 20, { align: "right" });
  }

  return doc;
}

function buildSummaryPDF(reporterName, organization, position, weeks) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ML = 50, MR = 50, pageW = W - ML - MR;
  let y = 0;

  const checkPage = (needed = 40) => { if (y + needed > H - 50) { doc.addPage(); y = 50; } };
  const setFont = (style = "normal", size = 11, color = [26, 26, 26]) => {
    doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
  };

  // Cover
  doc.setFillColor(45, 74, 62);
  doc.rect(0, 0, W, 90, "F");
  setFont("bold", 9, [255, 255, 255]);
  doc.text("OVERALL WEEKLY SUMMARY REPORT", ML, 28);
  setFont("bold", 20, [255, 255, 255]);
  doc.text(reporterName || "Reporter Name", ML, 55);
  setFont("normal", 11, [160, 200, 180]);
  doc.text(`${position}${organization ? "  ·  " + organization : ""}  ·  ${weeks.length} week${weeks.length !== 1 ? "s" : ""}  ·  ${totalHours(weeks)} total hrs`, ML, 73);

  y = 115;

  // Hours breakdown table
  doc.setFillColor(234, 230, 224);
  doc.rect(ML, y - 14, pageW, 22, "F");
  setFont("bold", 10, [45, 74, 62]);
  doc.text("HOURS BREAKDOWN BY WEEK", ML + 10, y);
  y += 18;

  const colW = [60, 180, 60, 60, 60, pageW - 60 - 180 - 60 - 60 - 60];
  const headers = ["Week #", "Date Range", "Days", "Holidays", "Hours", "Cumulative"];
  headers.forEach((h, i) => {
    setFont("bold", 8, [122, 112, 104]);
    doc.text(h, ML + colW.slice(0, i).reduce((a, b) => a + b, 0), y);
  });
  y += 14;
  doc.setDrawColor(226, 221, 214);
  doc.line(ML, y - 4, W - MR, y - 4);

  let cumulative = 0;
  weeks.forEach((week, wi) => {
    checkPage(22);
    const wh = weekHours(week);
    const holidays = week.days.filter(d => d.isHoliday).length;
    const workDays = week.days.filter(d => !d.isHoliday).length;
    cumulative += wh;
    const range = (week.startDate && week.endDate)
      ? `${formatDate(week.startDate)} – ${formatDate(week.endDate)}`
      : "—";
    const row = [`#${week.weekNumber}`, range, `${workDays}`, `${holidays}`, `${wh} hrs`, `${cumulative} hrs`];
    row.forEach((cell, i) => {
      setFont(i === 5 ? "bold" : "normal", 10, i === 5 ? [45, 74, 62] : [26, 26, 26]);
      doc.text(cell, ML + colW.slice(0, i).reduce((a, b) => a + b, 0), y);
    });
    if (wi % 2 === 0) {
      doc.setFillColor(247, 244, 239);
      doc.rect(ML, y - 12, pageW, 18, "F");
      row.forEach((cell, i) => {
        setFont(i === 5 ? "bold" : "normal", 10, i === 5 ? [45, 74, 62] : [26, 26, 26]);
        doc.text(cell, ML + colW.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
    }
    y += 18;
  });

  // Totals row
  const total = totalHours(weeks);
  const totalWorkDays = weeks.reduce((s, w) => s + w.days.filter(d => !d.isHoliday).length, 0);
  const totalHolidays = weeks.reduce((s, w) => s + w.days.filter(d => d.isHoliday).length, 0);
  doc.setFillColor(45, 74, 62);
  doc.rect(ML, y - 12, pageW, 20, "F");
  setFont("bold", 10, [255, 255, 255]);
  doc.text("TOTAL", ML + 10, y);
  doc.text(`${totalWorkDays} days`, ML + colW[0] + colW[1], y);
  doc.text(`${totalHolidays}`, ML + colW[0] + colW[1] + colW[2], y);
  doc.text(`${total} hrs`, ML + colW[0] + colW[1] + colW[2] + colW[3], y);
  y += 32;

  // Per-week summaries
  weeks.forEach((week, wi) => {
    const fields = [
      ["Summary", week.summary],
      ["Challenges & How Addressed", week.challenges],
      ["Skills Improved", week.skills],
      ["Lessons Learned", week.lessons],
    ].filter(([, v]) => v?.trim());

    if (!fields.length) return;

    checkPage(50);
    doc.setFillColor(234, 230, 224);
    doc.rect(ML, y - 14, pageW, 26, "F");
    setFont("bold", 12, [45, 74, 62]);
    doc.text(`Week #${week.weekNumber}`, ML + 10, y);
    if (week.startDate && week.endDate) {
      setFont("normal", 9, [122, 112, 104]);
      doc.text(`${formatDate(week.startDate)} – ${formatDate(week.endDate)}`, ML + 10, y + 12);
    }
    setFont("bold", 11, [45, 74, 62]);
    doc.text(`${weekHours(week)} hrs`, W - MR - 10, y, { align: "right" });
    y += 28;

    fields.forEach(([label, val]) => {
      const lines = doc.splitTextToSize(val, pageW - 20);
      checkPage(lines.length * 14 + 30);
      setFont("bold", 8, [122, 112, 104]);
      doc.text(label.toUpperCase() + ":", ML, y); y += 13;
      setFont("normal", 10, [26, 26, 26]);
      doc.text(lines, ML + 10, y);
      y += lines.length * 14 + 10;
    });
    y += 6;
  });

  // Page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    setFont("normal", 8, [180, 170, 160]);
    doc.text(`${reporterName} — Overall Summary Report`, ML, H - 20);
    doc.text(`${i} / ${pageCount}`, W - MR, H - 20, { align: "right" });
  }

  return doc;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const C = {
  bg: "#f7f4ef", surface: "#ffffff", border: "#e2ddd6",
  accent: "#2d4a3e", accentLight: "#4a7c68", gold: "#c9a84c",
  text: "#1a1a1a", muted: "#7a7068", danger: "#8b2a2a", tag: "#eae6e0",
};

const s = {
  label: { display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: "6px", fontFamily: "'DM Sans', sans-serif" },
  input: { width: "100%", padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "14px", color: C.text, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", transition: "border-color 0.15s" },
  textarea: { width: "100%", padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "14px", color: C.text, outline: "none", resize: "vertical", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, boxSizing: "border-box", minHeight: "80px" },
  btn: { padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em", transition: "all 0.15s" },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "24px", marginBottom: "16px" },
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Pill({ children, color = C.accent }) {
  return <span style={{ display: "inline-block", padding: "3px 12px", background: color + "18", color, border: `1px solid ${color}30`, borderRadius: "999px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{children}</span>;
}

function StatBox({ label, value, sub }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px 22px", flex: 1, minWidth: 100 }}>
      <div style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px", fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: C.accent, fontFamily: "'Lora', Georgia, serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: "12px", color: C.muted, marginTop: "4px", fontFamily: "'DM Sans', sans-serif" }}>{sub}</div>}
    </div>
  );
}

function DayEditor({ day, dayIndex, onChange, onRemove }) {
  const update = (f, v) => onChange({ ...day, [f]: v });
  const updateTask = (i, v) => { const t = [...day.tasks]; t[i] = v; onChange({ ...day, tasks: t }); };
  const addTask = () => onChange({ ...day, tasks: [...day.tasks, ""] });
  const removeTask = (i) => onChange({ ...day, tasks: day.tasks.filter((_, idx) => idx !== i) });
  const dayName = getDayName(day.date) || `Day ${dayIndex + 1}`;

  return (
    <div style={{ border: `1px solid ${day.isHoliday ? C.gold + "60" : C.border}`, borderLeft: `4px solid ${day.isHoliday ? C.gold : C.accentLight}`, borderRadius: "12px", padding: "20px", marginBottom: "12px", background: day.isHoliday ? "#fffdf5" : C.surface }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: "15px", fontFamily: "'Lora', serif", color: C.text }}>{dayName}</span>
          {day.date && <span style={{ fontSize: "13px", color: C.muted }}>{formatDate(day.date)}</span>}
          {day.isHoliday && <Pill color={C.gold}>Holiday</Pill>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px", color: C.muted, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <input type="checkbox" checked={day.isHoliday} onChange={e => update("isHoliday", e.target.checked)} style={{ accentColor: C.gold }} />
            Holiday
          </label>
          <button onClick={onRemove} style={{ ...s.btn, padding: "6px 12px", background: "#fff0f0", color: C.danger, border: `1px solid ${C.danger}30`, fontSize: "12px" }}>✕</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        <div><label style={s.label}>Date</label><input type="date" value={day.date} onChange={e => update("date", e.target.value)} style={s.input} /></div>
        <div>
          <label style={s.label}>Hours Worked</label>
          <input type="number" min={0} max={24} step={0.5} value={day.isHoliday ? 0 : day.hoursWorked} disabled={day.isHoliday}
            onChange={e => update("hoursWorked", e.target.value)}
            style={{ ...s.input, background: day.isHoliday ? "#f0f0f0" : C.bg, color: day.isHoliday ? C.muted : C.text }} />
        </div>
      </div>

      {day.isHoliday ? (
        <div><label style={s.label}>Holiday Name</label><input value={day.holidayName} onChange={e => update("holidayName", e.target.value)} placeholder="e.g. Chinese New Year" style={s.input} /></div>
      ) : (
        <>
          <div style={{ marginBottom: "14px" }}>
            <label style={s.label}>Key Tasks & Responsibilities</label>
            {day.tasks.map((task, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <input value={task} onChange={e => updateTask(i, e.target.value)} placeholder={`Task ${i + 1}…`} style={{ ...s.input, marginBottom: 0 }} />
                {day.tasks.length > 1 && <button onClick={() => removeTask(i)} style={{ ...s.btn, padding: "8px 12px", background: "#fff0f0", color: C.danger, border: `1px solid ${C.danger}20`, flexShrink: 0 }}>✕</button>}
              </div>
            ))}
            <button onClick={addTask} style={{ ...s.btn, background: C.tag, color: C.accentLight, marginTop: 4, fontSize: "12px" }}>+ Add Task</button>
          </div>
          <div><label style={s.label}>Experiences & Reflections</label>
            <textarea value={day.experiences} onChange={e => update("experiences", e.target.value)} placeholder="What did you learn or feel today?" style={s.textarea} rows={3} /></div>
        </>
      )}
    </div>
  );
}

function WeekEditor({ week, weekIndex, onChange, onRemove }) {
  const update = (f, v) => onChange({ ...week, [f]: v });
  const updateDay = (i, d) => { const days = [...week.days]; days[i] = d; onChange({ ...week, days }); };
  const addDay = () => onChange({ ...week, days: [...week.days, DEFAULT_DAY()] });
  const removeDay = (i) => onChange({ ...week, days: week.days.filter((_, idx) => idx !== i) });
  const wh = weekHours(week);

  return (
    <div style={{ ...s.card, borderTop: `4px solid ${C.accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: 10 }}>
        <div>
          <Pill>Week {week.weekNumber}</Pill>
          <h3 style={{ margin: "8px 0 2px", fontFamily: "'Lora', serif", fontSize: "20px", color: C.text }}>
            {week.startDate && week.endDate ? `${formatDate(week.startDate)} – ${formatDate(week.endDate)}` : "Set dates below"}
          </h3>
          <span style={{ fontSize: "13px", color: C.accentLight, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{wh} hrs · {week.days.length} day{week.days.length !== 1 ? "s" : ""}</span>
        </div>
        <button onClick={onRemove} style={{ ...s.btn, background: "#fff0f0", color: C.danger, border: `1px solid ${C.danger}20` }}>✕ Remove Week</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <div><label style={s.label}>Week #</label><input type="number" min={1} value={week.weekNumber} onChange={e => update("weekNumber", e.target.value)} style={s.input} /></div>
        <div><label style={s.label}>Start Date</label><input type="date" value={week.startDate} onChange={e => update("startDate", e.target.value)} style={s.input} /></div>
        <div><label style={s.label}>End Date</label><input type="date" value={week.endDate} onChange={e => update("endDate", e.target.value)} style={s.input} /></div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <label style={{ ...s.label, margin: 0 }}>Daily Log</label>
          <button onClick={addDay} style={{ ...s.btn, background: C.accent, color: "#fff", fontSize: "12px", padding: "7px 14px" }}>+ Add Day</button>
        </div>
        {week.days.map((day, i) => <DayEditor key={i} day={day} dayIndex={i} weekIndex={weekIndex} onChange={d => updateDay(i, d)} onRemove={() => removeDay(i)} />)}
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "20px" }}>
        <h4 style={{ margin: "0 0 16px", fontFamily: "'Lora', serif", color: C.text, fontSize: "16px" }}>Weekly Summary</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {[["summary", "Summary", "What did you accomplish overall?"], ["challenges", "Challenges & How Addressed", "What was hard?"], ["skills", "Skills Improved", "What did you develop?"], ["lessons", "Lessons Learned", "What will you take forward?"]].map(([field, label, ph]) => (
            <div key={field}><label style={s.label}>{label}</label><textarea value={week[field]} onChange={e => update(field, e.target.value)} placeholder={ph} style={s.textarea} rows={3} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PREVIEW ──────────────────────────────────────────────────────────────────

function ReportPreview({ reporterName, organization, position, weeks }) {
  const total = totalHours(weeks);
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: C.text, fontSize: "14px", lineHeight: 1.7 }}>
      <div style={{ background: C.accent, color: "#fff", padding: "32px 36px", borderRadius: "12px", marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6, marginBottom: "8px" }}>Weekly Narrative Report</div>
        <h1 style={{ margin: "0 0 6px", fontFamily: "'Lora', serif", fontSize: "26px", fontWeight: 700 }}>{reporterName || "Reporter Name"}</h1>
        <div style={{ opacity: 0.8, fontSize: "14px" }}>{position} {organization && `· ${organization}`}</div>
        <div style={{ marginTop: "16px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {[["Total Weeks", weeks.length], ["Total Hours", `${total} hrs`], ["Avg / Week", `${weeks.length ? Math.round(total / weeks.length) : 0} hrs`]].map(([l, v]) => (
            <div key={l}><span style={{ opacity: 0.6, fontSize: "12px" }}>{l}</span><br /><strong>{v}</strong></div>
          ))}
        </div>
      </div>

      {weeks.map((week, wi) => {
        const wh = weekHours(week);
        return (
          <div key={wi} style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${C.accent}`, paddingBottom: "10px", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, fontFamily: "'Lora', serif", fontSize: "20px" }}>Week #{week.weekNumber}</h2>
                {week.startDate && week.endDate && <div style={{ fontSize: "13px", color: C.muted }}>{formatDate(week.startDate)} – {formatDate(week.endDate)}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "22px", fontWeight: 700, color: C.accent, fontFamily: "'Lora', serif" }}>{wh} hrs</div>
                <div style={{ fontSize: "11px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>this week</div>
              </div>
            </div>

            {week.days.map((day, di) => (
              <div key={di} style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
                  <h3 style={{ margin: 0, fontFamily: "'Lora', serif", fontSize: "16px", color: C.accent }}>
                    Day {di + 1}{getDayName(day.date) ? ` (${getDayName(day.date)})` : ""}{day.date ? ` — ${formatDate(day.date)}` : ""}:
                  </h3>
                  {!day.isHoliday && <span style={{ fontSize: "12px", color: C.muted, background: C.tag, padding: "2px 10px", borderRadius: "999px" }}>{day.hoursWorked} hrs</span>}
                </div>
                {day.isHoliday ? (
                  <p style={{ margin: 0, color: C.muted, fontStyle: "italic" }}>🗓 Holiday — {day.holidayName || "No work required."}</p>
                ) : (
                  <>
                    <strong style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.07em", color: C.muted, display: "block", marginBottom: "6px" }}>Key Tasks & Responsibilities:</strong>
                    <ul style={{ margin: "0 0 10px", paddingLeft: "20px" }}>{day.tasks.filter(t => t.trim()).map((t, i) => <li key={i} style={{ marginBottom: "4px" }}>{t}</li>)}</ul>
                    {day.experiences && <><strong style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.07em", color: C.muted, display: "block", marginBottom: "6px" }}>Experiences:</strong><p style={{ margin: 0 }}>{day.experiences}</p></>}
                  </>
                )}
              </div>
            ))}

            {[["Summary", week.summary], ["Challenges & How Addressed", week.challenges], ["Skills Improved", week.skills], ["Lessons Learned", week.lessons]].filter(([, v]) => v?.trim()).map(([title, val]) => (
              <div key={title} style={{ marginBottom: "14px" }}>
                <strong style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.07em", color: C.muted, display: "block", marginBottom: "6px" }}>{title}:</strong>
                <p style={{ margin: 0 }}>{val}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── EXPORT BUTTON ────────────────────────────────────────────────────────────

function ExportButton({ label, icon, onClick, color = C.accent, disabled }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (disabled || loading) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 80));
    try { onClick(); } finally { setLoading(false); }
  };
  return (
    <button onClick={handle} disabled={disabled || loading} style={{ ...s.btn, background: color, color: "#fff", display: "flex", alignItems: "center", gap: 7, opacity: (disabled || loading) ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
      <span>{loading ? "⏳" : icon}</span> {loading ? "Generating…" : label}
    </button>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("editor");
  const [reporterName, setReporterName] = useState("Jonah Mark S. Tabuzo");
  const [organization, setOrganization] = useState("PHILRADS");
  const [position, setPosition] = useState("Intern");
  const [weeks, setWeeks] = useState([DEFAULT_WEEK()]);
  const [jsPDFReady, setJsPDFReady] = useState(!!window.jspdf);

  // Load jsPDF from CDN if not present
  useState(() => {
    if (window.jspdf) { setJsPDFReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => setJsPDFReady(true);
    document.head.appendChild(script);
  });

  const updateWeek = useCallback((i, w) => setWeeks(prev => prev.map((wk, idx) => idx === i ? w : wk)), []);
  const removeWeek = (i) => setWeeks(prev => prev.filter((_, idx) => idx !== i));
  const addWeek = () => setWeeks(prev => [...prev, { ...DEFAULT_WEEK(), weekNumber: prev.length + 1 }]);

  const total = totalHours(weeks);
  const totalDays = weeks.reduce((s, w) => s + w.days.filter(d => !d.isHoliday).length, 0);

  const exportFullPDF = () => {
    const doc = buildFullPDF(reporterName, organization, position, weeks);
    doc.save(`${reporterName.replace(/\s+/g, "_")}_Weekly_Report.pdf`);
  };

  const exportSummaryPDF = () => {
    const doc = buildSummaryPDF(reporterName, organization, position, weeks);
    doc.save(`${reporterName.replace(/\s+/g, "_")}_Summary_Report.pdf`);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; } input:focus, textarea:focus { border-color: ${C.accentLight} !important; } input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.5; }`}</style>

      {/* Top bar */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 28, background: C.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14 }}>📋</span>
          </div>
          <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 18, color: C.text }}>Narrative Report Builder</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {["editor", "preview"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...s.btn, background: tab === t ? C.accent : "transparent", color: tab === t ? "#fff" : C.muted, padding: "7px 18px", textTransform: "capitalize" }}>
              {t === "editor" ? "✏️ Editor" : "👁 Preview"}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: C.border, margin: "0 4px" }} />
          <ExportButton label="Export Full PDF" icon="📄" onClick={exportFullPDF} disabled={!jsPDFReady} />
          <ExportButton label="Export Summary" icon="📊" onClick={exportSummaryPDF} color={C.accentLight} disabled={!jsPDFReady} />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        {tab === "editor" && (
          <>
            {/* Stats */}
            <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
              <StatBox label="Total Hours" value={total} sub={`across ${weeks.length} week${weeks.length !== 1 ? "s" : ""}`} />
              <StatBox label="Work Days" value={totalDays} sub="excluding holidays" />
              <StatBox label="Avg / Day" value={totalDays ? (total / totalDays).toFixed(1) : "—"} sub="hrs per day" />
              <StatBox label="Avg / Week" value={weeks.length ? Math.round(total / weeks.length) : "—"} sub="hrs per week" />
            </div>

            {/* Reporter info */}
            <div style={s.card}>
              <h3 style={{ margin: "0 0 16px", fontFamily: "'Lora', serif", fontSize: "17px", color: C.text }}>Reporter Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[["Full Name", reporterName, setReporterName, "e.g. Juan dela Cruz"], ["Organization", organization, setOrganization, "e.g. PHILRADS"], ["Position / Role", position, setPosition, "e.g. Intern"]].map(([label, val, set, ph]) => (
                  <div key={label}><label style={s.label}>{label}</label><input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={s.input} /></div>
                ))}
              </div>
            </div>

            {/* Weeks */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontFamily: "'Lora', serif", fontSize: "18px", color: C.text }}>
                  Weeks <span style={{ fontSize: "14px", color: C.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>({weeks.length} total)</span>
                </h3>
                <button onClick={addWeek} style={{ ...s.btn, background: C.accent, color: "#fff" }}>+ Add Week</button>
              </div>
              {weeks.map((week, i) => <WeekEditor key={i} week={week} weekIndex={i} onChange={w => updateWeek(i, w)} onRemove={() => removeWeek(i)} />)}
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button onClick={() => setTab("preview")} style={{ ...s.btn, background: C.accent, color: "#fff", padding: "12px 32px", fontSize: "15px" }}>Preview Report →</button>
            </div>
          </>
        )}

        {tab === "preview" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
              <h3 style={{ margin: 0, fontFamily: "'Lora', serif", fontSize: "20px", color: C.text }}>Report Preview</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setTab("editor")} style={{ ...s.btn, background: C.tag, color: C.accent }}>← Back to Editor</button>
                <ExportButton label="Export Full PDF" icon="📄" onClick={exportFullPDF} disabled={!jsPDFReady} />
                <ExportButton label="Export Summary" icon="📊" onClick={exportSummaryPDF} color={C.accentLight} disabled={!jsPDFReady} />
              </div>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "36px 40px" }}>
              <ReportPreview reporterName={reporterName} organization={organization} position={position} weeks={weeks} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

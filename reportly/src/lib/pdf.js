import { formatDate, getDayName, weekHours, totalHours } from "./helpers";

function buildDoc(report, user) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ML = 50, pageW = W - 100;
  let y = 50;

  const checkPage = (n = 40) => {
    if (y + n > H - 50) { doc.addPage(); y = 50; }
  };

  // Cover header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, W, 90, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
  doc.text(report.title, ML, 40);
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(200, 200, 255);
  doc.text(`${user.name}  ·  ${report.weeks.length} weeks  ·  ${totalHours(report.weeks)} total hrs`, ML, 60);
  doc.setFontSize(9); doc.setTextColor(180, 180, 255);
  doc.text(`Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, ML, 76);
  y = 110;

  report.weeks.forEach((week, wi) => {
    if (wi > 0) { doc.addPage(); y = 50; }
    const wh = weekHours(week);

    // Week header
    doc.setFillColor(238, 242, 255);
    doc.rect(ML, y - 14, pageW, 26, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(67, 56, 202);
    doc.text(`Week #${week.weekNumber}`, ML + 10, y + 5);
    if (week.startDate && week.endDate) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(107, 114, 128);
      doc.text(`${formatDate(week.startDate)} – ${formatDate(week.endDate)}`, ML + 10, y + 17);
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(99, 102, 241);
    doc.text(`${wh} hrs`, W - 50, y + 5, { align: "right" });
    y += 32;

    // Days
    week.days.forEach((day, di) => {
      checkPage(50);
      const dn = getDayName(day.date);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(17, 24, 39);
      doc.text(`Day ${di + 1}${dn ? ` (${dn})` : ""} — ${formatDate(day.date) || "No date"}:`, ML, y);
      if (!day.isHoliday) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(156, 163, 175);
        doc.text(`${day.hoursWorked}h`, W - 50, y, { align: "right" });
      }
      y += 15;

      if (day.isHoliday) {
        doc.setFont("helvetica", "italic"); doc.setFontSize(10); doc.setTextColor(107, 114, 128);
        doc.text(`Holiday${day.holidayName ? " — " + day.holidayName : ""}`, ML + 10, y);
        y += 18;
      } else {
        const tasks = day.tasks.filter(t => t.trim());
        if (tasks.length) {
          doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(107, 114, 128);
          doc.text("TASKS:", ML, y); y += 12;
          tasks.forEach(t => {
            const lines = doc.splitTextToSize("• " + t, pageW - 20);
            checkPage(lines.length * 13 + 4);
            doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(17, 24, 39);
            doc.text(lines, ML + 10, y); y += lines.length * 13;
          });
        }
        if (day.experiences?.trim()) {
          checkPage(30);
          doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(107, 114, 128);
          doc.text("EXPERIENCES:", ML, y); y += 12;
          const lines = doc.splitTextToSize(day.experiences, pageW - 20);
          checkPage(lines.length * 13 + 4);
          doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(17, 24, 39);
          doc.text(lines, ML + 10, y); y += lines.length * 13;
        }
      }
      doc.setDrawColor(228, 231, 236);
      doc.line(ML, y + 4, W - 50, y + 4);
      y += 16;
    });

    // Weekly summary
    const sf = [["SUMMARY", week.summary], ["CHALLENGES", week.challenges], ["SKILLS", week.skills], ["LESSONS", week.lessons]].filter(([, v]) => v?.trim());
    if (sf.length) {
      checkPage(30);
      doc.setFillColor(248, 249, 251);
      doc.rect(ML, y - 10, pageW, 20, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(99, 102, 241);
      doc.text("WEEKLY SUMMARY", ML + 10, y + 4); y += 22;
      sf.forEach(([label, val]) => {
        const lines = doc.splitTextToSize(val, pageW - 20);
        checkPage(lines.length * 13 + 28);
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(107, 114, 128);
        doc.text(label + ":", ML, y); y += 12;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(17, 24, 39);
        doc.text(lines, ML + 10, y); y += lines.length * 13 + 8;
      });
    }
  });

  // Page numbers
  const pc = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pc; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(156, 163, 175);
    doc.text(`${report.title} — ${user.name}`, ML, H - 20);
    doc.text(`${i}/${pc}`, W - 50, H - 20, { align: "right" });
  }

  return doc;
}

export function exportReportPDF(report, user) {
  if (!window.jspdf) { console.error("jsPDF not loaded"); return; }
  const doc = buildDoc(report, user);
  doc.save(`${report.title.replace(/\s+/g, "_")}.pdf`);
}

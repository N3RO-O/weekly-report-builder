import { useState, useEffect } from "react";
import { LoginPage } from "./components/auth/LoginPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ReportEditor } from "./components/editor/ReportEditor";
import { useReports } from "./hooks/useReports";
import { MOCK_USER } from "./constants/defaults";

export default function App() {
  const [user, setUser] = useState(null);
  const [activeReportId, setActiveReportId] = useState(null);

  const { reports, openReport, createReport, updateReport, deleteReport, renameReport } = useReports(user);

  // Load jsPDF from CDN
  useEffect(() => {
    if (window.jspdf) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(s);
  }, []);

  const activeReport = reports.find(r => r.id === activeReportId);

  const handleOpen = (id) => {
    openReport(id);
    setActiveReportId(id);
  };

  const handleCreate = () => {
    const id = createReport();
    setActiveReportId(id);
  };

  const handleDelete = (id) => {
    deleteReport(id);
    if (activeReportId === id) setActiveReportId(null);
  };

  if (!user) {
    return <LoginPage onLogin={setUser} mockUser={MOCK_USER} />;
  }

  if (activeReport) {
    return (
      <ReportEditor
        report={activeReport}
        onBack={() => setActiveReportId(null)}
        onUpdate={updateReport}
        user={user}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      reports={reports}
      onOpen={handleOpen}
      onCreate={handleCreate}
      onDelete={handleDelete}
      onRename={renameReport}
    />
  );
}

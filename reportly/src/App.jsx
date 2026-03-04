import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { LoginPage } from "./components/auth/LoginPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ReportEditor } from "./components/editor/ReportEditor";
import { useReports } from "./hooks/useReports";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // prevents flash of login screen
  const [activeReportId, setActiveReportId] = useState(null);

  // ── Auth: check session on load + listen for changes ──────────────────────
  useEffect(() => {
    // 1. Get existing session (e.g. user refreshes the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // 2. Listen for login / logout / token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);

        // Clear active report on logout
        if (event === "SIGNED_OUT") setActiveReportId(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Load jsPDF from CDN ───────────────────────────────────────────────────
  useEffect(() => {
    if (window.jspdf) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(s);
  }, []);

  const {
    reports,
    loading: reportsLoading,
    openReport,
    createReport,
    updateReport,
    deleteReport,
    renameReport,
  } = useReports(user);

  const activeReport = reports.find(r => r.id === activeReportId);

  const handleOpen = (id) => {
    openReport(id);
    setActiveReportId(id);
  };

  const handleCreate = async () => {
    const id = await createReport();
    setActiveReportId(id);
  };

  const handleDelete = async (id) => {
    await deleteReport(id);
    if (activeReportId === id) setActiveReportId(null);
  };

  // ── Loading screen (prevents flashing login before session loads) ─────────
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fb", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, background: "#6366f1", borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>📋</div>
          <div style={{ width: 24, height: 24, border: "3px solid #e4e7ec", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  // ── Route: not logged in ──────────────────────────────────────────────────
  if (!user) return <LoginPage />;

  // ── Route: editing a report ───────────────────────────────────────────────
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

  // ── Route: dashboard ──────────────────────────────────────────────────────
  return (
    <Dashboard
      user={user}
      reports={reports}
      loading={reportsLoading}
      onOpen={handleOpen}
      onCreate={handleCreate}
      onDelete={handleDelete}
      onRename={renameReport}
    />
  );
}
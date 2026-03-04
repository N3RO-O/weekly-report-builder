import { useState } from "react";
import { SAMPLE_REPORTS, DEFAULT_REPORT, DEFAULT_WEEK } from "../constants/defaults";
import { totalHours } from "../lib/helpers";
// import { supabase } from "../lib/supabase"; // ← uncomment when ready

export function useReports(user) {
  const [reports, setReports] = useState(SAMPLE_REPORTS);

  // ── When wiring Supabase, replace useState above with: ───────────────────
  // const [reports, setReports] = useState([]);
  // useEffect(() => {
  //   supabase.from("reports").select("*").eq("user_id", user.id)
  //     .then(({ data }) => setReports(data || []));
  // }, [user.id]);

  const openReport = (id) => {
    setReports(prev =>
      prev.map(r => r.id === id && !r.weeks?.length ? { ...r, weeks: [DEFAULT_WEEK(1)] } : r)
    );
  };

  const createReport = () => {
    const r = DEFAULT_REPORT(user.id);
    setReports(prev => [r, ...prev]);
    // supabase.from("reports").insert(r); // ← Supabase
    return r.id;
  };

  const updateReport = (updated) => {
    setReports(prev =>
      prev.map(r => r.id === updated.id
        ? { ...updated, weekCount: updated.weeks.length, totalHours: totalHours(updated.weeks) }
        : r
      )
    );
    // supabase.from("reports").upsert(updated); // ← Supabase
  };

  const deleteReport = (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
    // supabase.from("reports").delete().eq("id", id); // ← Supabase
  };

  const renameReport = (id, title) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, title } : r));
    // supabase.from("reports").update({ title }).eq("id", id); // ← Supabase
  };

  return { reports, openReport, createReport, updateReport, deleteReport, renameReport };
}

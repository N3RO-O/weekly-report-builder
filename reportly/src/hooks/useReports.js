import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { DEFAULT_WEEK } from "../constants/defaults";
import { totalHours } from "../lib/helpers";
import { uid } from "../lib/helpers";

export function useReports(user) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => { setReports(data || []); setLoading(false); });
  }, [user?.id]);

  const openReport = (id) => {
    setReports(prev =>
      prev.map(r => r.id === id && !r.weeks?.length
        ? { ...r, weeks: [DEFAULT_WEEK(1)] } : r)
    );
  };

  const createReport = async () => {
    const r = {
      user_id: user.id,
      title: "Untitled Report",
      weeks: [DEFAULT_WEEK(1)],
      share_id: uid(),
      week_count: 1,
      total_hours: 0,
      updated_at: new Date().toISOString().slice(0, 10),
    };
    const { data } = await supabase.from("reports").insert(r).select().single();
    setReports(prev => [data, ...prev]);
    return data.id;
  };

  const updateReport = async (updated) => {
    setReports(prev => prev.map(r => r.id === updated.id
      ? { ...updated, week_count: updated.weeks.length, total_hours: totalHours(updated.weeks) }
      : r
    ));
    await supabase.from("reports").update({
      title: updated.title,
      weeks: updated.weeks,
      week_count: updated.weeks.length,
      total_hours: totalHours(updated.weeks),
      updated_at: new Date().toISOString().slice(0, 10),
    }).eq("id", updated.id);
  };

  const deleteReport = async (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
    await supabase.from("reports").delete().eq("id", id);
  };

  const renameReport = async (id, title) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, title } : r));
    await supabase.from("reports").update({ title }).eq("id", id);
  };

  return { reports, loading, openReport, createReport, updateReport, deleteReport, renameReport };
}
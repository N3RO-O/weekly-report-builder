export const uid = () => Math.random().toString(36).slice(2, 10);

export const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export const formatDate = (s) => {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const getDayName = (s) => {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
};

export const weekHours = (w) =>
  w.days.reduce((s, d) => s + (d.isHoliday ? 0 : Number(d.hoursWorked) || 0), 0);

export const totalHours = (weeks) =>
  weeks.reduce((s, w) => s + weekHours(w), 0);

export const timeAgo = (ds) => {
  const diff = Math.floor((Date.now() - new Date(ds)) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

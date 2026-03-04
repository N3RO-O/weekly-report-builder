import { uid } from "../lib/helpers";

export const DEFAULT_DAY = () => ({
  id: uid(), date: "", isHoliday: false, holidayName: "",
  tasks: [""], experiences: "", hoursWorked: 8,
});

export const DEFAULT_WEEK = (n = 1) => ({
  id: uid(), weekNumber: n, startDate: "", endDate: "",
  days: [DEFAULT_DAY()],
  summary: "", challenges: "", skills: "", lessons: "",
});

export const DEFAULT_REPORT = (userId) => ({
  id: uid(),
  title: "Untitled Report",
  updatedAt: new Date().toISOString().slice(0, 10),
  weeks: [DEFAULT_WEEK(1)],
  shareId: uid(),
  ownerId: userId,
});

export const MOCK_USER = {
  id: "user_nero", name: "Nero", email: "nero@example.com",
};

export const SAMPLE_REPORTS = [
  { id: "r1", title: "PHILRADS Internship", updatedAt: "2026-02-27", weekCount: 2, totalHours: 80, weeks: [], ownerId: "user_nero", shareId: "share_abc123" },
  { id: "r2", title: "Freelance Project — Client A", updatedAt: "2026-02-20", weekCount: 1, totalHours: 32, weeks: [], ownerId: "user_nero", shareId: "share_xyz789" },
];

export type WorkEntry = {
  id: number;
  work_date: string;
  start_time: string;
  end_time: string | null;
  total_minutes: number | null;
  status: "open" | "closed";
};

export type TodayData = {
  date: string;
  total_minutes: number;
  total: string;
  entries: WorkEntry[];
};


export type UpdateWorkEntryData = {
  work_date?: string;
  start_time?: string;
  end_time?: string;
};

export type WeekEntry = {
  id: number;
  date: string;
  start_time: string;
  end_time: string | null;
  total_minutes: number | null;
};

export type WeekData = {
  week_start: string;
  week_end: string;
  week_start_day: number;
  total_minutes: number;
  total: string;
  entries: WeekEntry[];
};

export type WorkHistoryData = WorkEntry[];
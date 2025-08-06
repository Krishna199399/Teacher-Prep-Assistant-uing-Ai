export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: "assessment" | "meeting" | "deadline" | "lesson";
  className: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  reminder?: boolean;
  color?: string;
} 
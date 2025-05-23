export type TaskUrgency = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string date
  category: string;
  completed: boolean;
  urgency: TaskUrgency;
  reminderDateTime?: string; // ISO string date-time
  reminderReasoning?: string;
}

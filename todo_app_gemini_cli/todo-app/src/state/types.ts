export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  order: number;
  subtasks?: Task[]; // planned for future
}

export interface AppState {
  tasks: Task[];
  filter: "all" | "active" | "completed";
  theme: "light" | "dark";
  selectedTaskId: string | null;
}
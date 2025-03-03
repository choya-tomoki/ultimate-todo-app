export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface TodoFormData {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
}

"use client";

import { Todo, Priority } from "@/app/lib/types";
import { Card, CardContent } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Button } from "@/app/components/ui/button";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { ja } from "date-fns/locale";

interface PriorityBadgeProps {
  priority: Priority;
}

const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const colorMap = {
    LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    HIGH: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const labelMap = {
    LOW: "低",
    MEDIUM: "中",
    HIGH: "高",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[priority]}`}
    >
      {labelMap[priority]}
    </span>
  );
};

interface TagBadgeProps {
  name: string;
  color?: string;
}

const TagBadge = ({ name, color = "blue" }: TagBadgeProps) => {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mr-1 mb-1"
    >
      {name}
    </span>
  );
};

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, data: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export const TodoItem = ({ todo, onUpdate, onDelete, onEdit }: TodoItemProps) => {
  const handleToggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed });
  };

  return (
    <Card className={`mb-4 ${todo.completed ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            className="mt-1 mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3
                className={`text-lg font-medium ${
                  todo.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {todo.title}
              </h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(todo)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(todo.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            {todo.description && (
              <p
                className={`mt-1 text-sm text-muted-foreground ${
                  todo.completed ? "line-through" : ""
                }`}
              >
                {todo.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap">
              <PriorityBadge priority={todo.priority} />

              {todo.dueDate && (
                <span className="ml-2 text-xs text-muted-foreground">
                  期限: {format(new Date(todo.dueDate), "yyyy年MM月dd日", {locale: ja})}
                </span>
              )}
            </div>

            {todo.tags && todo.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap">
                {todo.tags.map((tag) => (
                  <TagBadge key={tag.id} name={tag.name} color={tag.color} />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

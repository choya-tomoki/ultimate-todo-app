"use client";

import { useState, useEffect } from "react";
import { Todo, TodoFormData } from "@/app/lib/types";
import { TodoItem } from "@/app/components/todo-item";
import { TodoForm } from "@/app/components/todo-form";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useToast } from "@/app/components/ui/use-toast";
import { Plus, Search, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export const TodoContainer = () => {
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Todoリストの取得
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/todos");
      
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      
      const data: Todo[] = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast({
        title: "エラー",
        description: "タスクの読み込みに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchTodos();
  }, []);

  // 検索とフィルタリング
  useEffect(() => {
    let result = [...todos];
    
    // 検索フィルタリング
    if (searchTerm) {
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (todo.description &&
            todo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          todo.tags.some((tag) =>
            tag.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }
    
    // ステータスフィルタリング
    if (filterStatus !== "all") {
      result = result.filter((todo) => 
        filterStatus === "completed" ? todo.completed : !todo.completed
      );
    }
    
    // 優先度フィルタリング
    if (filterPriority !== "all") {
      result = result.filter((todo) => todo.priority === filterPriority);
    }
    
    setFilteredTodos(result);
  }, [todos, searchTerm, filterStatus, filterPriority]);

  // 新規タスク作成
  const handleCreateTodo = async (formData: TodoFormData) => {
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create todo");
      }
      
      await fetchTodos();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  };

  // タスク更新
  const handleUpdateTodo = async (id: string, data: Partial<Todo>) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update todo");
      }
      
      await fetchTodos();
      
      if (editingTodo) {
        setIsDialogOpen(false);
        setEditingTodo(undefined);
      }
    } catch (error) {
      console.error(`Error updating todo with id ${id}:`, error);
      toast({
        title: "エラー",
        description: "タスクの更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  // タスク削除
  const handleDeleteTodo = async (id: string) => {
    if (!confirm("このタスクを削除してもよろしいですか？")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }
      
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      toast({
        title: "成功",
        description: "タスクを削除しました",
      });
    } catch (error) {
      console.error(`Error deleting todo with id ${id}:`, error);
      toast({
        title: "エラー",
        description: "タスクの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  // 編集モード開始
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsDialogOpen(true);
  };

  // フォーム送信
  const handleFormSubmit = async (formData: TodoFormData) => {
    if (editingTodo) {
      await handleUpdateTodo(editingTodo.id, formData);
    } else {
      await handleCreateTodo(formData);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      {/* 検索とフィルター */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="タスクを検索..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setEditingTodo(undefined);
              setIsDialogOpen(true);
            }}
            className="flex-shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>新規タスク</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="mr-2 text-sm">フィルター:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="w-full sm:w-40">
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">未完了</SelectItem>
                  <SelectItem value="completed">完了済み</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Select
                value={filterPriority}
                onValueChange={setFilterPriority}
              >
                <SelectTrigger>
                  <SelectValue placeholder="優先度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="LOW">低</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="HIGH">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* タスクリスト */}
      <div>
        {isLoading ? (
          <div className="text-center p-8">読み込み中...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            タスクがありません
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              onEdit={handleEditTodo}
            />
          ))
        )}
      </div>

      {/* 新規作成/編集ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTodo ? "タスクを編集" : "新規タスク"}
            </DialogTitle>
          </DialogHeader>
          <TodoForm
            todo={editingTodo}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingTodo(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

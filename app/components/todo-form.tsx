"use client";

import { useState, useEffect } from "react";
import { Todo, TodoFormData, Priority } from "@/app/lib/types";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useToast } from "@/app/components/ui/use-toast";

interface TodoFormProps {
  todo?: Todo;
  onSubmit: (data: TodoFormData) => Promise<void>;
  onCancel: () => void;
}

export const TodoForm = ({ todo, onSubmit, onCancel }: TodoFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TodoFormData>({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: null,
    tags: [],
  });

  // 編集モードの場合、初期値をセット
  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description || "",
        priority: todo.priority,
        dueDate: todo.dueDate,
        tags: todo.tags.map((tag) => tag.name),
      });
    }
  }, [todo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");
    setFormData((prev) => ({ ...prev, tags: tagsArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "エラー",
        description: "タイトルを入力してください",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      toast({
        title: "成功",
        description: todo ? "タスクを更新しました" : "新しいタスクを作成しました",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "エラー",
        description: "タスクの保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="タスク名を入力"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="タスクの詳細を入力（オプション）"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">優先度</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => handleSelectChange(value, "priority")}
        >
          <SelectTrigger>
            <SelectValue placeholder="優先度を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">低</SelectItem>
            <SelectItem value="MEDIUM">中</SelectItem>
            <SelectItem value="HIGH">高</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">期限日</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate || ""}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">タグ（カンマ区切り）</Label>
        <Input
          id="tags"
          name="tags"
          value={formData.tags.join(", ")}
          onChange={handleTagsChange}
          placeholder="仕事, プライベート, 急ぎ など"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : todo ? "更新" : "追加"}
        </Button>
      </div>
    </form>
  );
};

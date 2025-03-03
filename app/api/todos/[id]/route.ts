import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const todoUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  completed: z.boolean().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

// 特定のToDoを取得
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: params.id },
      include: { tags: true },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error(`Error fetching todo with id ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch todo" },
      { status: 500 }
    );
  }
}

// 特定のToDoを更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validatedData = todoUpdateSchema.parse(body);

    // タグの処理
    const tags = validatedData.tags;
    delete validatedData.tags;

    // 日付処理
    const dueDate = validatedData.dueDate
      ? new Date(validatedData.dueDate)
      : null;

    // 既存のタスクの取得
    const existingTodo = await prisma.todo.findUnique({
      where: { id: params.id },
      include: { tags: true },
    });

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    // タスクの更新
    const updateData: any = { ...validatedData, dueDate };

    // タグの更新があれば処理
    let updateTodo;
    if (tags) {
      // 既存タグを切断
      await prisma.todo.update({
        where: { id: params.id },
        data: {
          tags: {
            disconnect: existingTodo.tags.map((tag) => ({ id: tag.id })),
          },
        },
      });

      // 新しいタグを接続
      updateTodo = await prisma.todo.update({
        where: { id: params.id },
        data: {
          ...updateData,
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
        include: { tags: true },
      });
    } else {
      // タグの更新がない場合
      updateTodo = await prisma.todo.update({
        where: { id: params.id },
        data: updateData,
        include: { tags: true },
      });
    }

    return NextResponse.json(updateTodo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(`Error updating todo with id ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

// 特定のToDoを削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: params.id },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    await prisma.todo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error(`Error deleting todo with id ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}

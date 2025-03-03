import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const todoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

// すべてのToDo取得
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
      include: { tags: true },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

// 新しいToDo作成
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = todoSchema.parse(body);

    // タグの処理
    const tags = validatedData.tags || [];
    delete validatedData.tags;

    // 日付処理
    const dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;

    const newTodo = await prisma.todo.create({
      data: {
        ...validatedData,
        dueDate,
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: { tags: true },
    });

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}

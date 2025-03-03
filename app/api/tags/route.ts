import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const tagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
});

// すべてのタグ取得
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

// 新しいタグ作成
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = tagSchema.parse(body);

    const existingTag = await prisma.tag.findUnique({
      where: { name: validatedData.name },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 400 }
      );
    }

    const newTag = await prisma.tag.create({
      data: validatedData,
    });

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}

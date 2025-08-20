import { NextRequest, NextResponse } from "next/server";
import { messageOperations } from "@/lib/database.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, assistantId, role, content, tokensUsed, modelUsed } = body;

    if (!userId || !assistantId || !role || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const message = await messageOperations.saveMessage(
      userId,
      assistantId,
      role,
      content,
      tokensUsed,
      modelUsed
    );

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}

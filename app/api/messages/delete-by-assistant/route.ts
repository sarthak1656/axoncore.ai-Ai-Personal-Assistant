import { NextRequest, NextResponse } from "next/server";
import { messageOperations } from "@/lib/database.server";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, assistantId } = body;

    if (!userId || !assistantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await messageOperations.deleteMessagesByAssistant(
      userId,
      assistantId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting messages:", error);
    return NextResponse.json(
      { error: "Failed to delete messages" },
      { status: 500 }
    );
  }
}

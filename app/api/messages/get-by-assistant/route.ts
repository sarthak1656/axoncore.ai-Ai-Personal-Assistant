import { NextRequest, NextResponse } from "next/server";
import { messageOperations } from "@/lib/database.server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const assistantId = searchParams.get("assistantId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userId || !assistantId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const messages = await messageOperations.getMessagesByAssistant(
      userId,
      assistantId,
      limit
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    return NextResponse.json(
      { error: "Failed to get messages" },
      { status: 500 }
    );
  }
}

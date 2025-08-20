import { NextRequest, NextResponse } from "next/server";
import { messageOperations } from "@/lib/database.server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const messages = await messageOperations.getRecentMessages(userId, limit);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error getting recent messages:", error);
    return NextResponse.json(
      { error: "Failed to get recent messages" },
      { status: 500 }
    );
  }
}

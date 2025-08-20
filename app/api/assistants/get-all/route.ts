import { NextRequest, NextResponse } from "next/server";
import { userAiAssistantOperations } from "@/lib/database.server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "Missing required parameter: uid" },
        { status: 400 }
      );
    }

    const assistants = await userAiAssistantOperations.getAllUserAssistants(uid);

    return NextResponse.json(assistants);
  } catch (error) {
    console.error("Error getting assistants:", error);
    return NextResponse.json(
      { error: "Failed to get assistants" },
      { status: 500 }
    );
  }
}

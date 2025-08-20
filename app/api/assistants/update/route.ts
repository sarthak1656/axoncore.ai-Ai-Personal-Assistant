import { NextRequest, NextResponse } from "next/server";
import { userAiAssistantOperations } from "@/lib/database.server";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userInstruction, aiModelId } = body;

    if (!id || !userInstruction || !aiModelId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await userAiAssistantOperations.updateUserAssistant(
      id,
      userInstruction,
      aiModelId
    );

    if (!result) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating assistant:", error);
    return NextResponse.json(
      { error: "Failed to update assistant" },
      { status: 500 }
    );
  }
}

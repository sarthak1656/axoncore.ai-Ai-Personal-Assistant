import { NextRequest, NextResponse } from "next/server";
import { userAiAssistantOperations } from "@/lib/database.server";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await userAiAssistantOperations.deleteUserAssistant(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assistant:", error);
    return NextResponse.json(
      { error: "Failed to delete assistant" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { userAiAssistantOperations } from "@/lib/database.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { record, uid } = body;

    console.log("API received:", { record, uid });

    if (!record || !uid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure record is an array
    const records = Array.isArray(record) ? record : [record];

    const insertedIds =
      await userAiAssistantOperations.insertSelectedAssistants(records, uid);

    return NextResponse.json({ insertedIds });
  } catch (error) {
    console.error("Error inserting assistants:", error);
    return NextResponse.json(
      { error: "Failed to insert assistants" },
      { status: 500 }
    );
  }
}

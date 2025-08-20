import { NextRequest, NextResponse } from "next/server";
import { userOperations } from "@/lib/database.server";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, tokensUsed } = body;

    console.log("update-tokens API received:", {
      uid,
      tokensUsed,
    });

    if (!uid || tokensUsed === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await userOperations.updateUserTokens(uid, tokensUsed);

    console.log("update-tokens API result:", result);

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating user tokens:", error);
    return NextResponse.json(
      { error: "Failed to update user tokens" },
      { status: 500 }
    );
  }
}

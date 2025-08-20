import { NextRequest, NextResponse } from "next/server";
import { userOperations } from "@/lib/database.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, picture } = body;

    if (!email || !name || !picture) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await userOperations.createUser(email, name, picture);

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getConversation } from "@/lib/conversations";

// Protected by middleware.ts (matcher covers /api/admin/:path*).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const result = await getConversation(sessionId);

  if (!result.ok) {
    const status = result.error === "Conversation not found" ? 404 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result.data);
}

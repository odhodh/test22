import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    serverConfigured: Boolean(process.env.GEMINI_API_KEY),
    provider: "Gemini",
  });
}

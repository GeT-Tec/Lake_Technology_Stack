import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
    });
  } catch (error: any) {
    console.error("[Health Check] DB connection failed:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        db: "disconnected",
        message: error?.message,
      },
      { status: 503 }
    );
  }
}

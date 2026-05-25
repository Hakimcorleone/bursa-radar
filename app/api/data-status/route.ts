import { NextResponse } from "next/server";
import { getDataStatus } from "@/lib/data/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getDataStatus();
  return NextResponse.json(data);
}

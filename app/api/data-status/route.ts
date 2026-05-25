import { NextResponse } from "next/server";
import { getDataStatus } from "@/lib/data/queries";

export async function GET() {
  const data = await getDataStatus();
  return NextResponse.json(data);
}

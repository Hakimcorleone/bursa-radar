import { NextResponse } from "next/server";
import { getWatchlistData } from "@/lib/data/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getWatchlistData();
  return NextResponse.json(data);
}

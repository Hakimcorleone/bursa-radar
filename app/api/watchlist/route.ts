import { NextResponse } from "next/server";
import { getWatchlistData } from "@/lib/data/queries";

export async function GET() {
  const data = await getWatchlistData();
  return NextResponse.json(data);
}

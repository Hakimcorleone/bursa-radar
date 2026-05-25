import { NextResponse } from "next/server";
import { getStocksData } from "@/lib/data/queries";

export async function GET() {
  const data = await getStocksData();
  return NextResponse.json(data);
}

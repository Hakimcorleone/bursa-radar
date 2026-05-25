import { NextResponse } from "next/server";
import { getStocksData } from "@/lib/data/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getStocksData();
  return NextResponse.json(data);
}

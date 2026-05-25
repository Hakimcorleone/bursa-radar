import { NextResponse } from "next/server";
import { getStockDetail } from "@/lib/data/queries";

export async function GET(_: Request, { params }: { params: { symbol: string } }) {
  const data = await getStockDetail(params.symbol);
  if (!data) return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  return NextResponse.json(data);
}

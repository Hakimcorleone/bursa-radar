import { NextResponse } from "next/server";
import { getStockDetail } from "@/lib/data/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { symbol: string } }) {
  const data = await getStockDetail(params.symbol);
  if (!data) return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  return NextResponse.json(data);
}

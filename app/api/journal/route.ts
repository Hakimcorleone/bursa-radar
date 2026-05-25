import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJournalData } from "@/lib/data/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getJournalData();
  return NextResponse.json(data.entries);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.stockId || !body.title || !body.body) {
    return NextResponse.json({ error: "stockId, title, and body are required" }, { status: 400 });
  }

  const entry = await prisma.personalJournal.create({
    data: {
      stockId: body.stockId,
      title: body.title,
      body: body.body,
      tag: body.tag || null
    },
    include: { stock: { select: { symbol: true, companyName: true } } }
  });

  return NextResponse.json({
    id: entry.id,
    stockId: entry.stockId,
    symbol: entry.stock.symbol,
    companyName: entry.stock.companyName,
    title: entry.title,
    body: entry.body,
    tag: entry.tag,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const entry = await prisma.personalJournal.update({
    where: { id: body.id },
    data: {
      title: body.title,
      body: body.body,
      tag: body.tag || null
    },
    include: { stock: { select: { symbol: true, companyName: true } } }
  });

  return NextResponse.json({
    id: entry.id,
    stockId: entry.stockId,
    symbol: entry.stock.symbol,
    companyName: entry.stock.companyName,
    title: entry.title,
    body: entry.body,
    tag: entry.tag,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await prisma.personalJournal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

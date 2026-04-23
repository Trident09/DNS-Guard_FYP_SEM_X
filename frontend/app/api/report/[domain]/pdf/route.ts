import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  const res = await fetch(
    `${process.env.BACKEND_URL}/report/${params.domain}/pdf`,
    { method: "GET" }
  );
  const blob = await res.arrayBuffer();
  return new NextResponse(blob, {
    status: res.status,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? "attachment",
    },
  });
}

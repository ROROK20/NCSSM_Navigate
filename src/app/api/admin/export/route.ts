import { NextResponse } from "next/server";
import { isEditor } from "@/lib/admin-auth";
import { getOverrides } from "@/lib/content";

/**
 * GET /api/admin/export — download the content overrides document.
 *
 * Editor-only. The overrides document holds published content edits and never
 * contains submissions, so exporting it cannot leak a student's words.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isEditor())) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const overrides = await getOverrides();
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(overrides, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="navigate-overrides-${stamp}.json"`,
      "cache-control": "no-store",
    },
  });
}

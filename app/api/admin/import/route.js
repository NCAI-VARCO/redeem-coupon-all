import { NextResponse } from "next/server";
import { getAdminDb, FieldValue } from "../../../../lib/firebaseAdmin";

export const runtime = "nodejs";

function requireAdmin(req) {
  const token = new URL(req.url).searchParams.get("token") || "";
  return token && token === process.env.ADMIN_TOKEN;
}

function parseUrls(text) {
  return [...new Set(
    String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
  )];
}

export async function POST(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ message: "관리자 토큰이 올바르지 않습니다." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const urls = parseUrls(body.urls);

    if (!urls.length) {
      return NextResponse.json({ message: "업로드할 URL이 없습니다." }, { status: 400 });
    }
    if (urls.length > 1500) {
      return NextResponse.json({ message: "한 번에 최대 1500개까지 업로드할 수 있습니다." }, { status: 400 });
    }

    const db = getAdminDb();
    const batchSize = 450;
    let uploaded = 0;

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = db.batch();
      const chunk = urls.slice(i, i + batchSize);

      chunk.forEach((url, index) => {
        const ref = db.collection("redeemCodes").doc();
        batch.set(ref, {
          url,
          used: false,
          usedAt: null,
          usedBy: null,
          createdAt: FieldValue.serverTimestamp(),
          source: "admin-upload",
          order: i + index + 1,
        });
      });

      await batch.commit();
      uploaded += chunk.length;
    }

    return NextResponse.json({ ok: true, uploaded });
  } catch (e) {
    return NextResponse.json({ message: e.message || "업로드 실패" }, { status: 500 });
  }
}

import { getAdminDb, FIRESTORE_DATABASE_ID } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

function toIso(ts) {
  try {
    return ts?.toDate ? ts.toDate().toISOString() : null;
  } catch {
    return null;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";

  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return Response.json(
      { ok: false, message: "관리자 토큰이 올바르지 않습니다." },
      { status: 401 }
    );
  }

  try {
    const db = getAdminDb();

    const snap = await db
      .collection("redeemCodes")
      .orderBy("createdAt", "asc")
      .get();

    const codes = snap.docs.map((doc) => {
      const data = doc.data();
      const used = data.used === true || data.status === "claimed";

      return {
        id: doc.id,
        url: data.url || "",
        used,
        status: used ? "used" : "available",
        usedAt: toIso(data.usedAt || data.claimedAt),
        usedBy: data.usedBy || data.claimedIp || null,
        createdAt: toIso(data.createdAt),
        order: typeof data.order === "number" ? data.order : null,
      };
    });

    const total = codes.length;
    const used = codes.filter((code) => code.used).length;
    const available = total - used;
    const usageRate = total === 0 ? 0 : Math.round((used / total) * 1000) / 10;

    return Response.json({
      ok: true,
      databaseId: FIRESTORE_DATABASE_ID,
      total,
      used,
      available,
      usageRate,
      codes,
    });
  } catch (e) {
    console.error("Dashboard API error:", e);
    return Response.json(
      {
        ok: false,
        message: e?.message || "Firebase 연결 중 오류가 발생했습니다.",
        databaseId: FIRESTORE_DATABASE_ID,
      },
      { status: 500 }
    );
  }
}

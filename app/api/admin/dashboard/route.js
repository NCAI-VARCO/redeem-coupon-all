import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (token !== process.env.ADMIN_TOKEN) {
    return Response.json(
      { ok: false, message: "Invalid admin token." },
      { status: 401 }
    );
  }

  const db = getAdminDb();

  const snap = await db
    .collection("redeemCodes")
    .orderBy("createdAt", "asc")
    .get();

  const codes = snap.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      url: data.url || "",
      used: data.used === true,
      usedAt: data.usedAt?.toDate
        ? data.usedAt.toDate().toISOString()
        : null,
      usedBy: data.usedBy || data.claimedIp || null,
    };
  });

  const total = codes.length;
  const used = codes.filter((code) => code.used).length;
  const available = total - used;

  return Response.json({
    ok: true,
    total,
    used,
    available,
    codes,
  });
}

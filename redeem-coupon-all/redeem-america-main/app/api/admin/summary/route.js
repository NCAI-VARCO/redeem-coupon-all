import { getAdminDb } from "@/lib/firebaseAdmin";
export const dynamic = "force-dynamic";
function fmt(ts) { try { return ts ? ts.toDate().toISOString() : null; } catch { return null; } }
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) return Response.json({ ok: false, message: "관리자 토큰이 올바르지 않습니다." }, { status: 401 });
  const db = getAdminDb();
  const [allSnap, claimedSnap, logsSnap] = await Promise.all([
    db.collection("redeemCodes").count().get(),
    db.collection("redeemCodes").where("status", "==", "claimed").count().get(),
    db.collection("claimLogs").orderBy("createdAt", "desc").limit(30).get(),
  ]);
  const total = allSnap.data().count;
  const claimed = claimedSnap.data().count;
  return Response.json({ ok: true, total, claimed, remaining: total - claimed, recentLogs: logsSnap.docs.map((doc) => { const d = doc.data(); return { id: doc.id, status: d.status, url: d.url || null, ip: d.ip || null, createdAt: fmt(d.createdAt) }; }) });
}

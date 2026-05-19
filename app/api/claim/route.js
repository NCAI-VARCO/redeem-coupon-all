import { cookies, headers } from "next/headers";
import { getAdminDb, FieldValue } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

async function getIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

function maskUserAgent(value) {
  return value ? value.slice(0, 240) : "unknown";
}

export async function POST() {
  const db = getAdminDb();
  const cookieStore = await cookies();
  const h = await headers();
  const existingId = cookieStore.get("redeem_claim_id")?.value;
  const ip = await getIp();
  const ua = maskUserAgent(h.get("user-agent"));

  try {
    // 이미 받은 사용자 체크
    if (existingId) {
      const existingSnap = await db.collection("redeemCodes").doc(existingId).get();
      if (existingSnap.exists) {
        const data = existingSnap.data();
        if (data?.url && data?.used === true) {
          await db.collection("claimLogs").add({
            status: "repeat",
            codeId: existingId,
            url: data.url,
            ip,
            userAgent: ua,
            createdAt: FieldValue.serverTimestamp(),
          });

          return Response.json({
            ok: true,
            repeated: true,
            redeemUrl: data.url,
          });
        }
      }
    }

    // 🔥 핵심 수정 부분
    const result = await db.runTransaction(async (tx) => {
      const q = db
        .collection("redeemCodes")
        .where("used", "==", false)
        .orderBy("createdAt", "asc")
        .limit(1);

      const snap = await tx.get(q);

      if (snap.empty) return null;

      const doc = snap.docs[0];

      tx.update(doc.ref, {
        used: true,
        usedAt: FieldValue.serverTimestamp(),
        usedBy: ip,
        claimedIp: ip,
        claimedUserAgent: ua,
      });

      const data = doc.data();

      return {
        id: doc.id,
        url: data.url,
      };
    });

    if (!result) {
      await db.collection("claimLogs").add({
        status: "soldout",
        ip,
        userAgent: ua,
        createdAt: FieldValue.serverTimestamp(),
      });

      return Response.json(
        {
          ok: false,
          message: "준비된 리딤 URL이 모두 소진되었습니다.",
        },
        { status: 410 }
      );
    }

    await db.collection("claimLogs").add({
      status: "claimed",
      codeId: result.id,
      url: result.url,
      ip,
      userAgent: ua,
      createdAt: FieldValue.serverTimestamp(),
    });

    cookieStore.set("redeem_claim_id", result.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return Response.json({
      ok: true,
      repeated: false,
      redeemUrl: result.url,
    });
  } catch (e) {
    console.error(e);

    return Response.json(
      {
        ok: false,
        message: "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

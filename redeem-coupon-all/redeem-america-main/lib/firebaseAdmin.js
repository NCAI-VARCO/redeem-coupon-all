import admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function privateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
}

export function getAdminDb() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const key = privateKey();

    if (!projectId || !clientEmail || !key) {
      throw new Error("Firebase 환경변수가 설정되지 않았습니다.");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: key,
      }),
    });
  }

  return getFirestore(admin.app(), "redeem-america");
}

export { FieldValue };

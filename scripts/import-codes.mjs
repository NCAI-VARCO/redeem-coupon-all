import fs from "fs";
import admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const FIRESTORE_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ||
  process.env.FIREBASE_DATABASE_ID ||
  "redeem-coupon-all";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return value;
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: requireEnv("FIREBASE_PROJECT_ID"),
    clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(admin.app(), FIRESTORE_DATABASE_ID);
const path = new URL("./redeem-links.csv", import.meta.url);
const text = fs.readFileSync(path, "utf8").trim();
const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const urls = [...new Set(rows[0]?.toLowerCase() === "url" ? rows.slice(1) : rows)];

if (!urls.length) {
  console.log("No URLs found.");
  process.exit(0);
}

const batchSize = 450;
let imported = 0;
for (let i = 0; i < urls.length; i += batchSize) {
  const batch = db.batch();
  const chunk = urls.slice(i, i + batchSize);

  chunk.forEach((url, index) => {
    const doc = db.collection("redeemCodes").doc();
    batch.set(doc, {
      url,
      used: false,
      usedAt: null,
      usedBy: null,
      status: "available",
      source: "script-import",
      order: i + index + 1,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  imported += chunk.length;
  await batch.commit();
}
console.log(`Imported ${imported} redeem URLs into Firestore database: ${FIRESTORE_DATABASE_ID}`);
process.exit(0);

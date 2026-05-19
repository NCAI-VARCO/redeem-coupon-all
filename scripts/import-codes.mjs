import fs from "fs";
import admin from "firebase-admin";

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

const db = admin.firestore();
const path = new URL("./redeem-links.csv", import.meta.url);
const text = fs.readFileSync(path, "utf8").trim();
const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const urls = rows[0]?.toLowerCase() === "url" ? rows.slice(1) : rows;

if (!urls.length) {
  console.log("No URLs found.");
  process.exit(0);
}

const batchSize = 450;
let imported = 0;
for (let i = 0; i < urls.length; i += batchSize) {
  const batch = db.batch();
  for (const url of urls.slice(i, i + batchSize)) {
    const doc = db.collection("redeemCodes").doc();
    batch.set(doc, {
      url,
      status: "available",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    imported++;
  }
  await batch.commit();
}
console.log(`Imported ${imported} redeem URLs.`);
process.exit(0);

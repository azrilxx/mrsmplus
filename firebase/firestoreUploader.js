
const admin = require("firebase-admin");
const fs = require("fs");

// Load Firebase service account key
const serviceAccount = require("../maraplus.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const questions = JSON.parse(fs.readFileSync("./data/exports/firestore_questions.json", "utf-8"));

// Upload each question to Firestore under 'questions' collection
async function uploadQuestions() {
  const batchSize = 500;
  let batch = db.batch();
  let count = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const docRef = db.collection("questions").doc(); // Auto-ID
    batch.set(docRef, q);
    count++;

    if (count % batchSize === 0 || i === questions.length - 1) {
      await batch.commit();
      console.log(`✅ Uploaded ${count} questions`);
      batch = db.batch(); // Start new batch
    }
  }
}

uploadQuestions()
  .then(() => {
    console.log("🎉 All questions uploaded successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Upload failed:", err);
    process.exit(1);
  });

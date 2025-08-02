
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Load Firebase service account key
const serviceAccount = require("../firebase-service-account.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://maraplus-ecd9d-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

// Generic uploader function for any collection
async function uploadToCollection(collectionName, dataFilePath, options = {}) {
  console.log(`🚀 Starting upload to ${collectionName} collection...`);
  
  try {
    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
    const batchSize = options.batchSize || 500;
    let batch = db.batch();
    let count = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const docRef = options.useCustomId && item.id 
        ? db.collection(collectionName).doc(item.id)
        : db.collection(collectionName).doc(); // Auto-ID
      
      batch.set(docRef, item);
      count++;

      if (count % batchSize === 0 || i === data.length - 1) {
        await batch.commit();
        console.log(`✅ Uploaded ${count} items to ${collectionName}`);
        batch = db.batch(); // Start new batch
      }
    }
    
    console.log(`🎉 All ${count} items uploaded to ${collectionName} successfully.`);
    return true;
  } catch (error) {
    console.error(`❌ Upload to ${collectionName} failed:`, error);
    return false;
  }
}

// Upload questions (legacy function for backward compatibility)
async function uploadQuestions() {
  const questionsPath = path.join(__dirname, "../data/exports/firestore_questions.json");
  if (!fs.existsSync(questionsPath)) {
    console.log("⚠️  Questions file not found, skipping upload");
    return true;
  }
  return await uploadToCollection("questions", questionsPath);
}

// Upload sample data for all collections
async function uploadSampleData() {
  console.log("📚 Uploading sample data for MARA+ collections...\n");
  
  const sampleData = {
    modules: [
      {
        id: "math_f3_algebra",
        title: "Form 3 Mathematics - Algebra",
        subject: "Mathematics",
        level: "Form 3",
        chapter: "Algebra",
        topics: ["Linear Equations", "Quadratic Equations"],
        created_at: new Date().toISOString()
      }
    ],
    xp_tracking: [
      {
        id: "sample_xp",
        user_id: "user123",
        activity: "completed_quiz",
        xp_earned: 50,
        timestamp: new Date().toISOString()
      }
    ],
    reflections: [
      {
        id: "sample_reflection",
        user_id: "user123",
        content: "Today I learned about quadratic equations",
        mood: "confident",
        timestamp: new Date().toISOString()
      }
    ]
  };
  
  const results = [];
  
  for (const [collection, data] of Object.entries(sampleData)) {
    const tempFile = path.join(__dirname, `../temp_${collection}.json`);
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    
    const success = await uploadToCollection(collection, tempFile, { useCustomId: true });
    results.push({ collection, success });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
  }
  
  return results.every(r => r.success);
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'questions':
      await uploadQuestions();
      break;
    case 'sample':
      await uploadSampleData();
      break;
    case 'custom':
      const collection = args[1];
      const filePath = args[2];
      if (!collection || !filePath) {
        console.log("Usage: node firestoreUploader.js custom <collection> <file-path>");
        process.exit(1);
      }
      await uploadToCollection(collection, filePath);
      break;
    default:
      console.log("🔧 MARA+ Firestore Uploader");
      console.log("Commands:");
      console.log("  questions - Upload questions from firestore_questions.json");
      console.log("  sample    - Upload sample data for all collections");
      console.log("  custom <collection> <file> - Upload custom data to specific collection");
      break;
  }
  
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Upload script failed:", err);
    process.exit(1);
  });
}

module.exports = { uploadToCollection, uploadQuestions, uploadSampleData };

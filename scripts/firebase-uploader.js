const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check if we're in mock mode
const MOCK_MODE = process.env.MOCK_MODE === 'true' || process.argv.includes('--mock');

let db;

if (MOCK_MODE) {
  console.log('🔧 Running in MOCK MODE - no actual Firebase uploads\n');
  // Mock Firestore interface
  db = {
    collection: (name) => ({
      doc: (docName) => ({
        collection: (subName) => ({
          doc: (subDocName) => ({
            get: async () => ({ exists: false }),
            set: async (data) => {
              return Promise.resolve();
            }
          })
        })
      })
    })
  };
} else {
  // Use existing Firebase initialization
  const serviceAccount = require('../firebase-service-account.json');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://maraplus-ecd9d-default-rtdb.firebaseio.com'
    });
  }
  
  db = admin.firestore();
}

class FirebaseUploader {
  constructor() {
    this.uploaded = 0;
    this.skipped = 0;
    this.failed = 0;
    this.results = [];
  }

  validateQuestionStructure(data) {
    const requiredFields = ['type', 'question', 'answer', 'hint', 'xp_value'];
    
    for (const field of requiredFields) {
      if (!data.hasOwnProperty(field)) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }

    // Validate question field (can be string or object with language keys)
    if (typeof data.question === 'string') {
      if (data.question.trim() === '') {
        return { valid: false, error: 'Question must be a non-empty string' };
      }
    } else if (typeof data.question === 'object' && data.question !== null) {
      // Check if it has at least one language key with non-empty content
      const questionKeys = Object.keys(data.question);
      if (questionKeys.length === 0) {
        return { valid: false, error: 'Question object must have at least one language key' };
      }
      
      const hasValidContent = questionKeys.some(key => 
        typeof data.question[key] === 'string' && data.question[key].trim() !== ''
      );
      
      if (!hasValidContent) {
        return { valid: false, error: 'Question must have at least one non-empty language variant' };
      }
    } else {
      return { valid: false, error: 'Question must be a string or object with language keys' };
    }

    if (typeof data.xp_value !== 'number' || data.xp_value <= 0) {
      return { valid: false, error: 'xp_value must be a positive number' };
    }

    return { valid: true };
  }

  async uploadQuestion(program, subject, questionId, filePath) {
    try {
      // Read and parse JSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const questionData = JSON.parse(fileContent);

      // Validate structure
      const validation = this.validateQuestionStructure(questionData);
      if (!validation.valid) {
        this.failed++;
        console.log(`❌ Failed ${filePath}: ${validation.error}`);
        return;
      }

      // Check if document already exists
      const docRef = db.collection('questions').doc(program).collection(subject).doc(questionId);
      const docSnapshot = await docRef.get();

      if (docSnapshot.exists) {
        this.skipped++;
        console.log(`⚠️ Skipped questions/${program}/${subject}/${questionId} (already exists)`);
        return;
      }

      // Upload to Firestore
      await docRef.set(questionData);
      this.uploaded++;
      console.log(`✅ Uploaded questions/${program}/${subject}/${questionId}`);

    } catch (error) {
      this.failed++;
      console.log(`❌ Failed ${filePath}: ${error.message}`);
    }
  }

  async processDirectory(baseDir) {
    const programs = fs.readdirSync(baseDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const program of programs) {
      const programPath = path.join(baseDir, program);
      const subjects = fs.readdirSync(programPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const subject of subjects) {
        const subjectPath = path.join(programPath, subject);
        const questionFiles = fs.readdirSync(subjectPath)
          .filter(file => file.endsWith('.json') && file.startsWith('q-'));

        for (const questionFile of questionFiles) {
          const questionId = path.basename(questionFile, '.json');
          const filePath = path.join(subjectPath, questionFile);
          
          await this.uploadQuestion(program, subject, questionId, filePath);
        }
      }
    }
  }

  printSummary() {
    console.log('\n📊 Upload Summary:');
    console.log(`✅ Uploaded: ${this.uploaded}`);
    console.log(`⚠️ Skipped (exists): ${this.skipped}`);
    console.log(`❌ Failed: ${this.failed}`);
  }
}

async function main() {
  console.log('🚀 Starting Firebase Upload Process...\n');
  
  const uploader = new FirebaseUploader();
  const questionsDir = path.join(__dirname, '../study_mode/questions');
  
  if (!fs.existsSync(questionsDir)) {
    console.error('❌ Questions directory not found:', questionsDir);
    process.exit(1);
  }

  try {
    await uploader.processDirectory(questionsDir);
    uploader.printSummary();
  } catch (error) {
    console.error('❌ Upload process failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FirebaseUploader;
const admin = require('firebase-admin');
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
        set: async (data) => {
          console.log(`   📝 Mock: ${name}/${docName} =>`, JSON.stringify(data, null, 2));
          return Promise.resolve();
        },
        get: async () => ({ exists: false })
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

class FirebaseSeeder {
  constructor() {
    this.seeded = 0;
    this.skipped = 0;
    this.failed = 0;
  }

  async seedDocument(collection, docId, data, description) {
    try {
      const docRef = db.collection(collection).doc(docId);
      
      if (!MOCK_MODE) {
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
          this.skipped++;
          console.log(`⚠️  Skipped ${collection}/${docId} (already exists)`);
          return;
        }
      }

      await docRef.set(data);
      this.seeded++;
      console.log(`✅ Seeded ${collection}/${docId} - ${description}`);

    } catch (error) {
      this.failed++;
      console.log(`❌ Failed ${collection}/${docId}: ${error.message}`);
    }
  }

  async seedUsers() {
    console.log('\n👤 Seeding users...');
    
    const timestamp = MOCK_MODE ? new Date() : admin.firestore.FieldValue.serverTimestamp();

    // Admin User
    await this.seedDocument('users', 'azril_admin', {
      email: "azril@muvonenergy.com",
      role: "admin",
      program: "bitara",
      created_at: timestamp
    }, 'Admin User');

    // Student Example
    await this.seedDocument('users', 'mrsm_3001', {
      email: "mrsm3001@student.edu.my",
      role: "student",
      program: "sains_tulen",
      created_at: timestamp
    }, 'Student Example');

    // Teacher Example
    await this.seedDocument('users', 'teacher_mrsm_1', {
      email: "teacher@mrsm.edu.my",
      role: "teacher",
      created_at: timestamp
    }, 'Teacher Example');

    // Parent Example
    await this.seedDocument('users', 'parent_mrsm_3001', {
      email: "azril.parent@gmail.com",
      role: "parent",
      child_ref: "mrsm_3001",
      created_at: timestamp
    }, 'Parent Example');
  }

  async seedXPLogs() {
    console.log('\n⚡ Seeding XP logs...');
    
    const timestamp = MOCK_MODE ? new Date() : admin.firestore.FieldValue.serverTimestamp();

    await this.seedDocument('xp_logs', 'mrsm_3001_q-1', {
      user_id: "mrsm_3001",
      question_id: "q-1",
      subject: "biology",
      program: "sains_tulen",
      xp_awarded: 50,
      timestamp: timestamp
    }, 'Sample XP Log');
  }

  async seedAnswers() {
    console.log('\n📝 Seeding answers...');
    
    const timestamp = MOCK_MODE ? new Date() : admin.firestore.FieldValue.serverTimestamp();

    await this.seedDocument('answers', 'mrsm_3001_q-1', {
      user_id: "mrsm_3001",
      question_id: "q-1",
      answer: "Mitochondria",
      correct: true,
      xp_earned: 50,
      submitted_at: timestamp
    }, 'Sample Answer');
  }

  async seedLeaderboard() {
    console.log('\n🏆 Seeding leaderboard...');
    
    await this.seedDocument('leaderboard', 'sains_tulen', {
      program: "sains_tulen",
      top_10: [
        { user: "mrsm_3001", xp: 1500 },
        { user: "student_alt_02", xp: 1200 }
      ],
      last_updated: MOCK_MODE ? new Date() : admin.firestore.FieldValue.serverTimestamp()
    }, 'Dummy Leaderboard');
  }

  async seedAll() {
    console.log('🌱 Starting Firebase seeding process...\n');
    
    await this.seedUsers();
    await this.seedXPLogs();
    await this.seedAnswers();
    await this.seedLeaderboard();
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Seeding Summary:');
    console.log(`✅ Seeded: ${this.seeded}`);
    console.log(`⚠️  Skipped (exists): ${this.skipped}`);
    console.log(`❌ Failed: ${this.failed}`);
    
    if (this.failed === 0) {
      console.log('\n🎉 Firebase seeding completed successfully!');
      console.log('🎯 App is now ready with core user and usage data');
    } else {
      console.log('\n⚠️  Some documents failed to seed. Check errors above.');
    }
  }
}

async function main() {
  const seeder = new FirebaseSeeder();
  
  try {
    await seeder.seedAll();
  } catch (error) {
    console.error('❌ Seeding process failed:', error.message);
    process.exit(1);
  }

  if (!MOCK_MODE) {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = FirebaseSeeder;
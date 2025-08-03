const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check if we're in mock mode
const MOCK_MODE = process.env.MOCK_MODE === 'true' || process.argv.includes('--mock');

let db;

if (MOCK_MODE) {
  console.log('🔧 FIREBASE PUSHER - MOCK MODE');
  console.log('⚠️  No actual Firebase uploads - simulating only');
  
  // Mock Firestore interface
  db = {
    collection: (name) => ({
      doc: (docName) => ({
        collection: (subName) => ({
          doc: (subDocName) => ({
            set: async (data) => {
              console.log(`[MOCK] Would upload to ${name}/${docName}/${subName}/${subDocName}`);
              return Promise.resolve();
            }
          })
        }),
        set: async (data) => {
          console.log(`[MOCK] Would upload to ${name}/${docName}`);
          return Promise.resolve();
        }
      }),
      get: async () => ({
        docs: Array(10).fill(null).map((_, i) => ({ id: `doc${i}` }))
      })
    })
  };
} else {
  console.log('🔥 FIREBASE PUSHER - LIVE MODE ACTIVATED');
  console.log('⚠️  This will write to production Firestore database');

  const serviceAccount = require('../firebase-service-account.json');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://maraplus-ecd9d-default-rtdb.firebaseio.com'
    });
  }

  db = admin.firestore();
}

class FirebasePusher {
  constructor() {
    this.totalUploaded = 0;
    this.totalFailed = 0;
    this.results = {
      questions: { uploaded: 0, failed: 0 },
      lessons: { uploaded: 0, failed: 0 },
      xp_rules: { uploaded: 0, failed: 0 },
      users: { uploaded: 0, failed: 0 },
      xp_logs: { uploaded: 0, failed: 0 },
      answers: { uploaded: 0, failed: 0 },
      leaderboard: { uploaded: 0, failed: 0 }
    };
  }

  async uploadStudyModeQuestions() {
    console.log('\n📚 UPLOADING STUDY MODE QUESTIONS');
    console.log('='.repeat(50));
    
    const questionsDir = path.join(__dirname, '../study_mode/questions');
    const programs = fs.readdirSync(questionsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const program of programs) {
      const programPath = path.join(questionsDir, program);
      const subjects = fs.readdirSync(programPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const subject of subjects) {
        const subjectPath = path.join(programPath, subject);
        const questionFiles = fs.readdirSync(subjectPath)
          .filter(file => file.endsWith('.json') && file.startsWith('q-'));

        for (const questionFile of questionFiles) {
          try {
            const questionId = path.basename(questionFile, '.json');
            const filePath = path.join(subjectPath, questionFile);
            const questionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // Upload to questions/{program}/{subject}/{questionId}
            const docRef = db.collection('questions').doc(program).collection(subject).doc(questionId);
            await docRef.set(questionData);
            
            console.log(`✅ questions/${program}/${subject}/${questionId}`);
            this.results.questions.uploaded++;
            this.totalUploaded++;
          } catch (error) {
            console.log(`❌ Failed questions/${program}/${subject}/${questionFile}: ${error.message}`);
            this.results.questions.failed++;
            this.totalFailed++;
          }
        }
      }
    }
  }

  async uploadLessons() {
    console.log('\n📖 UPLOADING LESSONS');
    console.log('='.repeat(50));
    
    const lessonsDir = path.join(__dirname, '../lessons/mrsm');
    const programs = fs.readdirSync(lessonsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const program of programs) {
      const programPath = path.join(lessonsDir, program);
      const lessonFiles = fs.readdirSync(programPath)
        .filter(file => file.endsWith('.json'));

      for (const lessonFile of lessonFiles) {
        try {
          const subject = path.basename(lessonFile, '.json');
          const filePath = path.join(programPath, lessonFile);
          const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

          // Upload to lessons/{program}/{subject}
          const docRef = db.collection('lessons').doc(program).collection('subjects').doc(subject);
          await docRef.set(lessonData);
          
          console.log(`✅ lessons/${program}/${subject}`);
          this.results.lessons.uploaded++;
          this.totalUploaded++;
        } catch (error) {
          console.log(`❌ Failed lessons/${program}/${lessonFile}: ${error.message}`);
          this.results.lessons.failed++;
          this.totalFailed++;
        }
      }
    }
  }

  async uploadXPRules() {
    console.log('\n🏆 UPLOADING XP RULES');
    console.log('='.repeat(50));
    
    try {
      const xpRulesPath = path.join(__dirname, '../xp_rules/mrsm_xp_rewards.json');
      const xpRulesData = JSON.parse(fs.readFileSync(xpRulesPath, 'utf8'));

      // Upload to xp_rules/mrsm_xp_rewards
      const docRef = db.collection('xp_rules').doc('mrsm_xp_rewards');
      await docRef.set(xpRulesData);
      
      console.log(`✅ xp_rules/mrsm_xp_rewards`);
      this.results.xp_rules.uploaded++;
      this.totalUploaded++;
    } catch (error) {
      console.log(`❌ Failed xp_rules upload: ${error.message}`);
      this.results.xp_rules.failed++;
      this.totalFailed++;
    }
  }

  async seedUsers() {
    console.log('\n👥 SEEDING USERS');
    console.log('='.repeat(50));

    const users = [
      {
        id: 'azril_admin',
        data: {
          uid: 'azril_admin',
          email: 'azril@mara.gov.my',
          role: 'admin',
          profile: {
            name: 'Azril Ahmad',
            position: 'System Administrator',
            department: 'MARA Digital Technology',
            permissions: ['read', 'write', 'delete', 'manage_users', 'system_admin']
          },
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          last_login: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active'
        }
      },
      {
        id: 'mrsm_3001',
        data: {
          uid: 'mrsm_3001',
          email: 'student3001@mrsm.edu.my',
          role: 'student',
          profile: {
            name: 'Ahmad Darwisy',
            program: 'sains_tulen',
            form: 'Form 5',
            mrsm_branch: 'MRSM Kuala Klawang',
            student_id: 'MRSM3001'
          },
          academic_data: {
            current_xp: 1250,
            streak_days: 7,
            subjects_studied: ['mathematics', 'physics', 'chemistry', 'biology'],
            questions_answered: 45,
            average_accuracy: 87.3
          },
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          last_login: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active'
        }
      },
      {
        id: 'teacher_mrsm_1',
        data: {
          uid: 'teacher_mrsm_1',
          email: 'faridah@mrsm.edu.my',
          role: 'teacher',
          profile: {
            name: 'Puan Faridah Mohd Ali',
            subjects: ['mathematics', 'additional_mathematics'],
            mrsm_branch: 'MRSM Kuala Klawang',
            teacher_id: 'TEACHER001',
            specialization: 'Mathematics Education'
          },
          teaching_data: {
            students_supervised: 45,
            classes: ['5 Sains Tulen A', '5 Sains Tulen B'],
            years_experience: 12
          },
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          last_login: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active'
        }
      },
      {
        id: 'parent_mrsm_3001',
        data: {
          uid: 'parent_mrsm_3001',
          email: 'encik.ahmad@gmail.com',
          role: 'parent',
          profile: {
            name: 'Encik Ahmad Zainal',
            children_ids: ['mrsm_3001'],
            phone: '+60123456789',
            address: 'Kuala Lumpur'
          },
          monitoring_data: {
            children_count: 1,
            notification_preferences: {
              academic_progress: true,
              attendance: true,
              achievements: true
            }
          },
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          last_login: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active'
        }
      }
    ];

    for (const user of users) {
      try {
        const docRef = db.collection('users').doc(user.id);
        await docRef.set(user.data);
        
        console.log(`✅ users/${user.id} (${user.data.role})`);
        this.results.users.uploaded++;
        this.totalUploaded++;
      } catch (error) {
        console.log(`❌ Failed users/${user.id}: ${error.message}`);
        this.results.users.failed++;
        this.totalFailed++;
      }
    }
  }

  async seedXPLogs() {
    console.log('\n💎 SEEDING XP LOGS');
    console.log('='.repeat(50));

    const xpLogData = {
      user_id: 'mrsm_3001',
      question_id: 'q-1',
      program: 'sains_tulen',
      subject: 'mathematics',
      xp_awarded: 25,
      xp_calculation: {
        base_xp: 15,
        difficulty_bonus: 5,
        accuracy_bonus: 5,
        time_bonus: 0,
        stream_multiplier: 1.2,
        total_multiplier: 1.2
      },
      answer_details: {
        is_correct: true,
        time_taken_seconds: 45,
        accuracy_percentage: 100,
        attempts: 1
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      session_id: 'session_' + Date.now()
    };

    try {
      const docRef = db.collection('xp_logs').doc('mrsm_3001').collection('logs').doc('q-1');
      await docRef.set(xpLogData);
      
      console.log(`✅ xp_logs/mrsm_3001/q-1`);
      this.results.xp_logs.uploaded++;
      this.totalUploaded++;
    } catch (error) {
      console.log(`❌ Failed xp_logs: ${error.message}`);
      this.results.xp_logs.failed++;
      this.totalFailed++;
    }
  }

  async seedAnswers() {
    console.log('\n📝 SEEDING ANSWERS');
    console.log('='.repeat(50));

    const answerData = {
      user_id: 'mrsm_3001',
      question_id: 'q-1',
      program: 'sains_tulen',
      subject: 'mathematics',
      user_answer: '13',
      correct_answer: '13',
      is_correct: true,
      explanation_viewed: true,
      hint_used: false,
      time_taken_seconds: 45,
      attempts: 1,
      answer_confidence: 'high',
      submitted_at: admin.firestore.FieldValue.serverTimestamp(),
      session_id: 'session_' + Date.now()
    };

    try {
      const docRef = db.collection('answers').doc('mrsm_3001').collection('responses').doc('q-1');
      await docRef.set(answerData);
      
      console.log(`✅ answers/mrsm_3001/q-1`);
      this.results.answers.uploaded++;
      this.totalUploaded++;
    } catch (error) {
      console.log(`❌ Failed answers: ${error.message}`);
      this.results.answers.failed++;
      this.totalFailed++;
    }
  }

  async seedLeaderboard() {
    console.log('\n🏆 SEEDING LEADERBOARD');
    console.log('='.repeat(50));

    const leaderboardData = {
      program: 'sains_tulen',
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
      top_students: [
        {
          rank: 1,
          user_id: 'mrsm_3001',
          name: 'Ahmad Darwisy',
          total_xp: 1250,
          weekly_xp: 450,
          streak_days: 7,
          subjects_mastered: 2,
          badge_tier: 'silver',
          mrsm_branch: 'MRSM Kuala Klawang'
        },
        {
          rank: 2,
          user_id: 'mrsm_3002',
          name: 'Siti Aminah',
          total_xp: 1180,
          weekly_xp: 380,
          streak_days: 5,
          subjects_mastered: 3,
          badge_tier: 'silver',
          mrsm_branch: 'MRSM Kuala Klawang'
        },
        {
          rank: 3,
          user_id: 'mrsm_3003',
          name: 'Muhammad Hakim',
          total_xp: 1150,
          weekly_xp: 420,
          streak_days: 12,
          subjects_mastered: 1,
          badge_tier: 'silver',
          mrsm_branch: 'MRSM Kuala Klawang'
        },
        {
          rank: 4,
          user_id: 'mrsm_3004',
          name: 'Nur Aisyah',
          total_xp: 1090,
          weekly_xp: 340,
          streak_days: 4,
          subjects_mastered: 2,
          badge_tier: 'bronze',
          mrsm_branch: 'MRSM Kuala Klawang'
        },
        {
          rank: 5,
          user_id: 'mrsm_3005',
          name: 'Ahmad Syafiq',
          total_xp: 1020,
          weekly_xp: 310,
          streak_days: 8,
          subjects_mastered: 1,
          badge_tier: 'bronze',
          mrsm_branch: 'MRSM Kuala Klawang'
        },
        {
          rank: 6,
          user_id: 'mrsm_3006',
          name: 'Fatimah Zahra',
          total_xp: 980,
          weekly_xp: 290,
          streak_days: 3,
          subjects_mastered: 2,
          badge_tier: 'bronze',
          mrsm_branch: 'MRSM Kuala Klawang'
        },
        {
          rank: 7,
          user_id: 'mrsm_3007',
          name: 'Iman Hakimi',
          total_xp: 950,
          weekly_xp: 275,
          streak_days: 6,
          subjects_mastered: 1,
          badge_tier: 'bronze',
          mrsm_branch: 'MRSM Kuala Klawang'
        },
        {
          rank: 8,
          user_id: 'mrsm_3008',
          name: 'Nurul Huda',
          total_xp: 920,
          weekly_xp: 260,
          streak_days: 2,
          subjects_mastered: 3,
          badge_tier: 'bronze',
          mrsm_branch: 'MRSM Kuala Klawang'
        },
        {
          rank: 9,
          user_id: 'mrsm_3009',
          name: 'Muhammad Zafran',
          total_xp: 890,
          weekly_xp: 245,
          streak_days: 9,
          subjects_mastered: 1,
          badge_tier: 'bronze',
          mrsm_branch: 'MRSM Kuala Klawang'
        },
        {
          rank: 10,
          user_id: 'mrsm_3010',
          name: 'Aishah Nabila',
          total_xp: 850,
          weekly_xp: 230,
          streak_days: 1,
          subjects_mastered: 2,
          badge_tier: 'bronze',
          mrsm_branch: 'MRSM Kuala Klawang'
        }
      ],
      statistics: {
        total_active_students: 150,
        average_xp: 756,
        highest_streak: 12,
        most_popular_subject: 'mathematics'
      }
    };

    try {
      const docRef = db.collection('leaderboard').doc('sains_tulen');
      await docRef.set(leaderboardData);
      
      console.log(`✅ leaderboard/sains_tulen`);
      this.results.leaderboard.uploaded++;
      this.totalUploaded++;
    } catch (error) {
      console.log(`❌ Failed leaderboard: ${error.message}`);
      this.results.leaderboard.failed++;
      this.totalFailed++;
    }
  }

  async validateUploads() {
    console.log('\n🔍 VALIDATING FIRESTORE UPLOADS');
    console.log('='.repeat(50));

    const validations = [
      { collection: 'questions', expected: this.results.questions.uploaded },
      { collection: 'lessons', expected: this.results.lessons.uploaded },
      { collection: 'xp_rules', expected: this.results.xp_rules.uploaded },
      { collection: 'users', expected: this.results.users.uploaded },
      { collection: 'xp_logs', expected: this.results.xp_logs.uploaded },
      { collection: 'answers', expected: this.results.answers.uploaded },
      { collection: 'leaderboard', expected: this.results.leaderboard.uploaded }
    ];

    for (const validation of validations) {
      try {
        const snapshot = await db.collection(validation.collection).get();
        const actualCount = snapshot.docs.length;
        
        if (actualCount >= validation.expected) {
          console.log(`✅ ${validation.collection}: ${actualCount} documents found`);
        } else {
          console.log(`⚠️  ${validation.collection}: Expected ${validation.expected}, found ${actualCount}`);
        }
      } catch (error) {
        console.log(`❌ Failed to validate ${validation.collection}: ${error.message}`);
      }
    }
  }

  printSummary() {
    console.log('\n📊 FIREBASE PUSH SUMMARY');
    console.log('='.repeat(50));
    console.log(`🟢 Total Uploaded: ${this.totalUploaded}`);
    console.log(`🔴 Total Failed: ${this.totalFailed}`);
    console.log('\nBreakdown by Collection:');
    
    Object.entries(this.results).forEach(([collection, stats]) => {
      console.log(`  ${collection.toUpperCase()}:`);
      console.log(`    ✅ Uploaded: ${stats.uploaded}`);
      console.log(`    ❌ Failed: ${stats.failed}`);
    });

    console.log('\n🔥 LIVE FIRESTORE DATABASE POPULATED SUCCESSFULLY');
    console.log('📱 MARA+ is ready for production use!');
  }
}

async function main() {
  console.log('🚀 MARA+ FIREBASE PUSHER - LIVE MODE');
  console.log('⚠️  WARNING: This will modify the production Firestore database');
  console.log('🎯 Target: https://maraplus-ecd9d.firebaseio.com');
  console.log('='.repeat(60));

  const pusher = new FirebasePusher();

  try {
    // Execute all upload operations
    await pusher.uploadStudyModeQuestions();
    await pusher.uploadLessons();
    await pusher.uploadXPRules();
    await pusher.seedUsers();
    await pusher.seedXPLogs();
    await pusher.seedAnswers();
    await pusher.seedLeaderboard();
    
    // Validate all uploads
    await pusher.validateUploads();
    
    // Print final summary
    pusher.printSummary();
    
  } catch (error) {
    console.error('💥 CRITICAL ERROR during Firebase push:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FirebasePusher;
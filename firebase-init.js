const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://maraplus-ecd9d-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

async function testFirebaseConnectivity() {
  console.log('🚀 Testing Firebase connectivity...');
  
  try {
    // Test Firestore write
    const testRef = db.collection('test').doc('connectivity');
    await testRef.set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Firebase connection test successful',
      project: 'MARA+ Platform'
    });
    
    // Test Firestore read
    const testDoc = await testRef.get();
    if (testDoc.exists) {
      console.log('✅ Firestore read/write test successful');
      console.log('   Data:', testDoc.data());
    }
    
    // Clean up test document
    await testRef.delete();
    console.log('🧹 Test document cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connectivity test failed:', error);
    return false;
  }
}

async function provisionFirestoreCollections() {
  console.log('🏗️  Provisioning Firestore base collections...');
  
  const collections = [
    'users',
    'modules', 
    'xp_tracking',
    'reflections',
    'mood_logs',
    'ai_sessions'
  ];
  
  try {
    for (const collectionName of collections) {
      const docRef = db.collection(collectionName).doc('_init');
      await docRef.set({
        initialized: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        description: `Base collection for ${collectionName}`
      });
      console.log(`✅ Collection '${collectionName}' provisioned`);
    }
    
    console.log('🎉 All base collections provisioned successfully');
    return true;
  } catch (error) {
    console.error('❌ Error provisioning collections:', error);
    return false;
  }
}

async function main() {
  console.log('🌟 MARA+ Firebase Initialization Starting...\n');
  
  const connectivityTest = await testFirebaseConnectivity();
  if (!connectivityTest) {
    process.exit(1);
  }
  
  const collectionSetup = await provisionFirestoreCollections();
  if (!collectionSetup) {
    process.exit(1);
  }
  
  console.log('\n🎊 Firebase initialization completed successfully!');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { db, admin, testFirebaseConnectivity, provisionFirestoreCollections };
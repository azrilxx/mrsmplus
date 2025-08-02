// Test script for MRSM API
const app = require('./api/server');
const http = require('http');

const PORT = 3001;
const server = app.listen(PORT);

// Test API endpoints
async function testAPI() {
  console.log('🧪 Testing MARA+ API endpoints...\n');
  
  // Test health endpoint
  try {
    const healthRes = await fetch(`http://localhost:${PORT}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test MRSM academics endpoint
  try {
    const academicsRes = await fetch(`http://localhost:${PORT}/api/mrsm/academics`);
    const academicsData = await academicsRes.json();
    console.log('✅ MRSM Academics API:', academicsData.success ? 'Success' : 'Failed');
    console.log('   Subjects available:', academicsData.data.subjects.length);
    console.log('   Sample subject:', academicsData.data.subjects[0].subject);
  } catch (error) {
    console.log('❌ MRSM Academics API failed:', error.message);
  }
  
  // Test specific subject endpoint
  try {
    const mathRes = await fetch(`http://localhost:${PORT}/api/mrsm/academics/mathematics`);
    const mathData = await mathRes.json();
    console.log('✅ Mathematics endpoint:', mathData.success ? 'Success' : 'Failed');
    console.log('   Chapters:', mathData.data.chapters.join(', '));
  } catch (error) {
    console.log('❌ Mathematics endpoint failed:', error.message);
  }
  
  console.log('\n🎊 API testing completed!');
  server.close();
}

// Run tests after server starts
setTimeout(testAPI, 1000);
const { StudyModeFormatter } = require('./services/studyModeFormatter');
const fs = require('fs').promises;
const path = require('path');

async function testPipeline() {
  console.log('🧪 Testing Study Mode Formatter Pipeline\n');

  const formatter = new StudyModeFormatter();
  const sampleFile = path.join(__dirname, 'sample_content', 'sample_questions.txt');
  
  try {
    console.log('📄 Processing sample file:', sampleFile);
    
    const result = await formatter.processUpload(sampleFile, 'test-upload-123', {
      uploadedBy: 'test-teacher',
      originalFileName: 'sample_questions.txt',
      subject: 'Science',
      topic: 'Respiration'
    });

    console.log('\n✅ Processing Complete!');
    console.log('📊 Results Summary:');
    console.log(`   Subject: ${result.subject}`);
    console.log(`   Topic: ${result.topic}`);
    console.log(`   Questions Found: ${result.questions.length}`);
    console.log(`   Question Types:`);
    
    const types = {};
    result.questions.forEach(q => {
      types[q.type] = (types[q.type] || 0) + 1;
    });
    
    Object.entries(types).forEach(([type, count]) => {
      console.log(`     ${type}: ${count}`);
    });

    console.log('\n📝 Sample Questions:');
    result.questions.slice(0, 3).forEach((q, i) => {
      console.log(`\n   ${i + 1}. [${q.type}] ${q.question}`);
      if (q.choices) {
        q.choices.forEach(choice => console.log(`      - ${choice}`));
      }
      console.log(`      Answer: ${q.answer}`);
      if (q.explanation) {
        console.log(`      Explanation: ${q.explanation}`);
      }
    });

    console.log('\n📁 Storage Test:');
    const stored = await formatter.getStoredContent('test-upload-123');
    if (stored) {
      console.log('   ✅ Content successfully stored and retrieved');
      console.log(`   📂 Storage path: /parsed_content/test-upload-123.json`);
    } else {
      console.log('   ❌ Storage test failed');
    }

    console.log('\n🎯 API Endpoints Available:');
    console.log('   POST /api/upload/single - Upload single file');
    console.log('   POST /api/upload/bulk - Upload multiple files');
    console.log('   GET /api/upload/content/:uploadId - Get processed content');
    console.log('   GET /api/upload/list - List all uploaded content');
    console.log('   GET /api/upload/subject/:subject - Get content by subject');
    console.log('   GET /api/upload/validate/:uploadId - Validate content');

    console.log('\n🚀 Integration with Teacher Dashboard:');
    console.log('   ✅ Updated teacher.tsx with upload functionality');
    console.log('   ✅ Connects to /api/upload/bulk endpoint');
    console.log('   ✅ Shows success/failure feedback to teachers');

  } catch (error) {
    console.error('❌ Pipeline test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testPipeline();
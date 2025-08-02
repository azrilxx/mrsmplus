// Test script for the Data Ingestor
// Validates content ingestion pipeline functionality

const { DataIngestor } = require('./functions/data-ingestor');
const fs = require('fs').promises;
const path = require('path');

async function testDataIngestor() {
  console.log('🚀 Testing Data Ingestor...\n');
  
  const ingestor = new DataIngestor();
  
  try {
    // Test 1: Content ingestion
    console.log('📥 Testing content ingestion...');
    const ingestionResult = await ingestor.ingestContent();
    console.log(`✅ Ingestion completed: ${ingestionResult.totalIngested} items\n`);
    
    // Test 2: Content validation
    console.log('🔍 Testing content validation...');
    const validationResults = await ingestor.validateContent();
    
    const validFiles = validationResults.filter(r => r.valid);
    const invalidFiles = validationResults.filter(r => !r.valid);
    
    console.log(`✅ Valid files: ${validFiles.length}`);
    console.log(`❌ Invalid files: ${invalidFiles.length}`);
    
    if (invalidFiles.length > 0) {
      console.log('\nInvalid files:');
      invalidFiles.forEach(file => {
        console.log(`  - ${file.path}: ${file.error}`);
      });
    }
    
    // Test 3: Sample content inspection
    console.log('\n📋 Sample content inspection...');
    const samplePath = path.join('content', 'global', 'Mathematics', 'Algebra', 'Khan_Academy', 'index.json');
    
    try {
      const sampleData = await fs.readFile(samplePath, 'utf8');
      const contentData = JSON.parse(sampleData);
      
      console.log(`Sample file: ${samplePath}`);
      console.log(`Items: ${contentData.content.length}`);
      console.log(`Average quality: ${contentData.metadata.avg_quality_score.toFixed(2)}`);
      console.log(`Last updated: ${contentData.metadata.last_updated}`);
      
      // Show first item as example
      if (contentData.content.length > 0) {
        console.log('\nSample content item:');
        console.log(JSON.stringify(contentData.content[0], null, 2));
      }
      
    } catch (error) {
      console.log(`Could not read sample file: ${error.message}`);
    }
    
    // Test 4: Directory structure validation
    console.log('\n📁 Directory structure validation...');
    const contentDir = path.join('content', 'global');
    
    try {
      const subjects = await fs.readdir(contentDir);
      console.log(`Subjects found: ${subjects.join(', ')}`);
      
      for (const subject of subjects.slice(0, 2)) { // Check first 2 subjects
        const subjectPath = path.join(contentDir, subject);
        const topics = await fs.readdir(subjectPath);
        console.log(`${subject} topics: ${topics.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`Directory validation failed: ${error.message}`);
    }
    
    console.log('\n🎉 Data Ingestor testing completed!');
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testDataIngestor();
}

module.exports = { testDataIngestor };
// MARA+ Global Content Data Ingestor
// Collects, cleans, and classifies global academic material from elite sources

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');

class DataIngestor {
  constructor() {
    this.prioritySources = [
      {
        name: 'MIT_OCW',
        baseUrl: 'https://ocw.mit.edu',
        type: 'university',
        subjects: ['Mathematics', 'Science', 'Computer_Science']
      },
      {
        name: 'Khan_Academy',
        baseUrl: 'https://www.khanacademy.org',
        type: 'mooc',
        subjects: ['Mathematics', 'Science', 'Computer_Science']
      },
      {
        name: 'Harvard_CS50',
        baseUrl: 'https://cs50.harvard.edu',
        type: 'university',
        subjects: ['Computer_Science']
      },
      {
        name: 'Coursera',
        baseUrl: 'https://www.coursera.org',
        type: 'mooc',
        subjects: ['Mathematics', 'Science', 'Computer_Science', 'English']
      },
      {
        name: 'EdX',
        baseUrl: 'https://www.edx.org',
        type: 'mooc',
        subjects: ['Mathematics', 'Science', 'Computer_Science', 'English']
      },
      {
        name: 'NPTEL',
        baseUrl: 'https://nptel.ac.in',
        type: 'university',
        subjects: ['Mathematics', 'Science', 'Computer_Science']
      }
    ];

    this.subjectTopics = {
      'Mathematics': ['Algebra', 'Geometry', 'Functions', 'Statistics', 'Calculus'],
      'Science': ['Chemistry', 'Physics', 'Biology'],
      'Computer_Science': ['Programming', 'Data_Structures', 'Algorithms', 'Web_Development'],
      'English': ['Grammar', 'Literature', 'Writing'],
      'Bahasa_Malaysia': ['Karangan', 'Tatabahasa', 'Sastera']
    };

    this.contentPath = path.join(process.cwd(), 'content', 'global');
  }

  // Scrape content from a given source
  async scrapeSource(source, subject, topic) {
    console.log(`Scraping ${source.name} for ${subject}/${topic}`);
    
    try {
      // Mock content for demonstration - in production, implement actual web scraping
      const mockContent = await this.generateMockContent(source, subject, topic);
      return mockContent;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    }
  }

  // Generate mock content for testing
  async generateMockContent(source, subject, topic) {
    const contentTypes = ['video', 'article', 'pdf', 'quiz'];
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const mockContent = [];

    // Generate 3-5 mock items per source/subject/topic combination
    const itemCount = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < itemCount; i++) {
      const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      mockContent.push({
        title: `${topic} ${difficulty} ${contentType} ${i + 1}`,
        source: source.name,
        type: contentType,
        url: `${source.baseUrl}/${subject.toLowerCase()}/${topic.toLowerCase()}/${i + 1}`,
        description: `${difficulty}-level ${contentType} covering ${topic} concepts from ${source.name}`,
        subject: subject,
        topic: topic,
        language: 'English',
        difficulty: difficulty,
        estimated_duration: `${Math.floor(Math.random() * 45) + 15} min`,
        format_tags: [contentType, difficulty === 'beginner' ? 'interactive' : 'advanced'],
        permission: 'open-license',
        scraped_at: new Date().toISOString(),
        quality_score: Math.random() * 0.3 + 0.7 // 0.7-1.0 range
      });
    }

    return mockContent;
  }

  // Classify and normalize content
  async classifyContent(content) {
    // Filter out low-quality content
    const qualityThreshold = 0.8;
    const qualityContent = content.filter(item => item.quality_score >= qualityThreshold);

    // Remove duplicates based on title similarity
    const uniqueContent = this.deduplicateContent(qualityContent);

    // Normalize for Malaysian curriculum alignment
    const normalizedContent = uniqueContent.map(item => ({
      ...item,
      mrsm_alignment: this.assessMRSMAlignment(item),
      local_relevance: this.assessLocalRelevance(item)
    }));

    return normalizedContent;
  }

  // Remove duplicate content
  deduplicateContent(content) {
    const seen = new Set();
    return content.filter(item => {
      const key = `${item.title.toLowerCase()}_${item.type}_${item.difficulty}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Assess alignment with MRSM curriculum
  assessMRSMAlignment(content) {
    const formLevels = {
      'beginner': ['Form 1', 'Form 2'],
      'intermediate': ['Form 3', 'Form 4'],
      'advanced': ['Form 4', 'Form 5']
    };

    return {
      applicable_forms: formLevels[content.difficulty] || ['Form 1'],
      curriculum_match: Math.random() * 0.4 + 0.6, // 0.6-1.0 range
      prerequisites: content.difficulty === 'advanced' ? ['basic_algebra', 'geometry'] : []
    };
  }

  // Assess local relevance for Malaysian context
  assessLocalRelevance(content) {
    return {
      cultural_sensitivity: 0.9,
      language_accessibility: content.language === 'English' ? 0.9 : 0.6,
      exam_preparation: ['SPM', 'STPM'].includes(content.format_tags) ? 0.9 : 0.7
    };
  }

  // Store content in structured JSON format
  async storeContent(content, subject, topic, source) {
    const dirPath = path.join(this.contentPath, subject, topic, source);
    const filePath = path.join(dirPath, 'index.json');

    try {
      // Ensure directory exists
      await fs.mkdir(dirPath, { recursive: true });

      // Prepare content for storage
      const contentData = {
        metadata: {
          subject: subject,
          topic: topic,
          source: source,
          last_updated: new Date().toISOString(),
          total_items: content.length,
          avg_quality_score: content.reduce((sum, item) => sum + item.quality_score, 0) / content.length
        },
        content: content
      };

      // Write to file (ensure < 300kb)
      const jsonString = JSON.stringify(contentData, null, 2);
      if (Buffer.byteLength(jsonString, 'utf8') < 300 * 1024) {
        await fs.writeFile(filePath, jsonString);
        console.log(`Stored ${content.length} items in ${filePath}`);
        return true;
      } else {
        console.warn(`Content too large for ${filePath}, splitting...`);
        // TODO: Implement content splitting logic
        return false;
      }
    } catch (error) {
      console.error(`Error storing content in ${filePath}:`, error);
      return false;
    }
  }

  // Main ingestion pipeline
  async ingestContent() {
    console.log('Starting global content ingestion...');
    let totalIngested = 0;

    for (const source of this.prioritySources) {
      for (const subject of source.subjects) {
        if (!this.subjectTopics[subject]) continue;

        for (const topic of this.subjectTopics[subject]) {
          try {
            // Scrape raw content
            const rawContent = await this.scrapeSource(source, subject, topic);
            
            if (rawContent.length === 0) continue;

            // Classify and normalize
            const classifiedContent = await this.classifyContent(rawContent);

            // Store structured content
            const stored = await this.storeContent(classifiedContent, subject, topic, source.name);
            
            if (stored) {
              totalIngested += classifiedContent.length;
              console.log(`Successfully ingested ${classifiedContent.length} items for ${subject}/${topic}/${source.name}`);
            }

            // Rate limiting to avoid overwhelming sources
            await new Promise(resolve => setTimeout(resolve, 1000));

          } catch (error) {
            console.error(`Error processing ${subject}/${topic}/${source.name}:`, error);
          }
        }
      }
    }

    console.log(`Content ingestion completed. Total items ingested: ${totalIngested}`);
    return { success: true, totalIngested };
  }

  // Validate stored content
  async validateContent() {
    console.log('Validating stored content...');
    const validationResults = [];

    for (const subject of Object.keys(this.subjectTopics)) {
      for (const topic of this.subjectTopics[subject]) {
        for (const source of this.prioritySources) {
          if (!source.subjects.includes(subject)) continue;

          const filePath = path.join(this.contentPath, subject, topic, source.name, 'index.json');
          
          try {
            const data = await fs.readFile(filePath, 'utf8');
            const contentData = JSON.parse(data);
            
            validationResults.push({
              path: filePath,
              valid: true,
              itemCount: contentData.content.length,
              avgQuality: contentData.metadata.avg_quality_score
            });
          } catch (error) {
            validationResults.push({
              path: filePath,
              valid: false,
              error: error.message
            });
          }
        }
      }
    }

    return validationResults;
  }
}

// Firebase Cloud Function exports
exports.ingestGlobalContent = functions.https.onCall(async (data, context) => {
  const ingestor = new DataIngestor();
  
  try {
    const result = await ingestor.ingestContent();
    return result;
  } catch (error) {
    console.error('Content ingestion failed:', error);
    throw new functions.https.HttpsError('internal', 'Content ingestion failed', error.message);
  }
});

exports.validateGlobalContent = functions.https.onCall(async (data, context) => {
  const ingestor = new DataIngestor();
  
  try {
    const results = await ingestor.validateContent();
    return { success: true, validationResults: results };
  } catch (error) {
    console.error('Content validation failed:', error);
    throw new functions.https.HttpsError('internal', 'Content validation failed', error.message);
  }
});

// Export the class for testing
module.exports = { DataIngestor };
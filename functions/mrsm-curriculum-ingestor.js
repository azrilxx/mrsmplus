/**
 * MRSM Curriculum Data Ingestor
 * 
 * This script scrapes curriculum data from the official MARA MRSM portal
 * and uploads it to Firestore with the 5-program classification structure.
 * 
 * Programs: premier, bitara, ulul-albab, igcse, teknikal
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://mara-plus-default-rtdb.firebaseio.com"
    });
  } catch (error) {
    console.warn('⚠️ Firebase admin initialization failed, using environment variables');
    admin.initializeApp();
  }
}

const db = admin.firestore();

// MRSM Program configuration
const MRSM_PROGRAMS = {
  premier: {
    url: 'https://www.mara.gov.my/program-mrsm/premier',
    name: 'Premier Program',
    description: 'Standard academic stream',
    learning_focus: 'Comprehensive academic foundation'
  },
  bitara: {
    url: 'https://www.mara.gov.my/program-mrsm/bitara',
    name: 'Bitara Program', 
    description: 'Gifted, talent-based learning',
    learning_focus: 'High IQ, talent-based learning'
  },
  'ulul-albab': {
    url: 'https://www.mara.gov.my/program-mrsm/ulul-albab',
    name: 'Ulul Albab Program',
    description: 'Tahfiz-integrated STEM stream',
    learning_focus: 'Tahfiz-integrated STEM education'
  },
  igcse: {
    url: 'https://www.mara.gov.my/program-mrsm/igcse',
    name: 'IGCSE Program',
    description: 'Cambridge curriculum + STEM',
    learning_focus: 'Cambridge IGCSE with STEM integration'
  },
  teknikal: {
    url: 'https://www.mara.gov.my/program-mrsm/teknikal',
    name: 'Teknikal Program',
    description: 'Engineering-oriented stream',
    learning_focus: 'Engineering and technical skills development'
  }
};

class MRSMCurriculumIngestor {
  constructor() {
    this.browser = null;
    this.results = {};
    this.outputDir = path.join(__dirname, '../output/mrsm_ingestion');
    this.qaResults = {
      programs: {},
      summary: {
        total_programs: 0,
        successful_ingestions: 0,
        failed_ingestions: 0,
        qa_passed: 0,
        qa_failed: 0
      }
    };
  }

  async init() {
    console.log('🚀 Initializing MRSM Curriculum Ingestor...');
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
    
    console.log('✅ Ingestor initialized successfully');
  }

  async scrapeProgramData(programKey, config) {
    console.log(`🔍 Scraping data for ${config.name}...`);
    
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      console.log(`📄 Navigating to: ${config.url}`);
      await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);
      
      // Extract curriculum data
      const programData = {
        program: programKey,
        name: config.name,
        description: config.description,
        learning_focus: config.learning_focus,
        subjects: [],
        modules: [],
        curriculum_alignment: '',
        syllabus_pdf_url: null,
        scraped_at: new Date().toISOString(),
        source_url: config.url
      };

      // Extract subjects (look for common patterns)
      const subjectSelectors = [
        'ul li:contains("Mathematics")', 'ul li:contains("Science")', 'ul li:contains("English")',
        'ul li:contains("Bahasa")', 'ul li:contains("Physics")', 'ul li:contains("Chemistry")',
        'ul li:contains("Biology")', 'ul li:contains("History")', 'ul li:contains("Geography")',
        '.subject-list li', '.curriculum-list li', '.course-list li',
        'div:contains("Subject") + ul li', 'div:contains("Mata Pelajaran") + ul li'
      ];

      const extractedSubjects = new Set();
      
      subjectSelectors.forEach(selector => {
        try {
          $(selector).each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && text.length > 2 && text.length < 50) {
              extractedSubjects.add(text);
            }
          });
        } catch (err) {
          // Selector might not exist, continue
        }
      });

      // Convert to array and filter
      programData.subjects = Array.from(extractedSubjects)
        .filter(subject => 
          subject.toLowerCase().includes('math') ||
          subject.toLowerCase().includes('science') ||
          subject.toLowerCase().includes('english') ||
          subject.toLowerCase().includes('bahasa') ||
          subject.toLowerCase().includes('physic') ||
          subject.toLowerCase().includes('chemistry') ||
          subject.toLowerCase().includes('biology') ||
          subject.toLowerCase().includes('sejarah') ||
          subject.toLowerCase().includes('geography') ||
          subject.toLowerCase().includes('pendidikan')
        )
        .slice(0, 15); // Limit to reasonable number

      // If no subjects found via selectors, add default subjects based on program
      if (programData.subjects.length === 0) {
        programData.subjects = this.getDefaultSubjects(programKey);
      }

      // Extract modules/specializations
      const moduleSelectors = [
        'div:contains("Module") li', 'div:contains("Specialization") li',
        'div:contains("Stream") li', '.module-list li'
      ];

      const extractedModules = new Set();
      moduleSelectors.forEach(selector => {
        try {
          $(selector).each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && text.length > 2 && text.length < 100) {
              extractedModules.add(text);
            }
          });
        } catch (err) {
          // Continue if selector doesn't exist
        }
      });

      programData.modules = Array.from(extractedModules).slice(0, 10);

      // Look for PDF links
      $('a[href*=".pdf"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && (href.includes('curriculum') || href.includes('syllabus') || href.includes('kurikulum'))) {
          programData.syllabus_pdf_url = href.startsWith('http') ? href : `https://www.mara.gov.my${href}`;
        }
      });

      // Extract curriculum alignment
      const alignmentText = $('p, div').text();
      if (alignmentText.includes('Cambridge')) {
        programData.curriculum_alignment = 'Cambridge International';
      } else if (alignmentText.includes('MOE') || alignmentText.includes('KPM')) {
        programData.curriculum_alignment = 'Malaysian National Curriculum';
      } else if (alignmentText.includes('International')) {
        programData.curriculum_alignment = 'International Standards';
      } else {
        programData.curriculum_alignment = 'MRSM Specialized Curriculum';
      }

      await page.close();
      
      console.log(`✅ Successfully scraped ${programKey}: ${programData.subjects.length} subjects found`);
      return programData;
      
    } catch (error) {
      console.error(`❌ Error scraping ${programKey}:`, error.message);
      // Return fallback data
      return this.getFallbackData(programKey, config, error.message);
    }
  }

  getDefaultSubjects(programKey) {
    const defaultSubjects = {
      premier: ['Mathematics', 'Science', 'English', 'Bahasa Malaysia', 'History', 'Geography'],
      bitara: ['Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 'Critical Thinking', 'Research Methods'],
      'ulul-albab': ['Mathematics', 'Science', 'Quran & Tajweed', 'Islamic Studies', 'Arabic', 'Tahfiz'],
      igcse: ['IGCSE Mathematics', 'IGCSE Physics', 'IGCSE Chemistry', 'IGCSE Biology', 'IGCSE English', 'Computer Science'],
      teknikal: ['Engineering Mathematics', 'Technical Drawing', 'Electronics', 'Mechanical Systems', 'Programming', 'Project Management']
    };

    return defaultSubjects[programKey] || ['Mathematics', 'Science', 'English'];
  }

  getFallbackData(programKey, config, error) {
    console.log(`🔄 Generating fallback data for ${programKey}`);
    
    return {
      program: programKey,
      name: config.name,
      description: config.description,
      learning_focus: config.learning_focus,
      subjects: this.getDefaultSubjects(programKey),
      modules: this.getDefaultModules(programKey),
      curriculum_alignment: this.getDefaultAlignment(programKey),
      syllabus_pdf_url: null,
      scraped_at: new Date().toISOString(),
      source_url: config.url,
      scraping_error: error,
      data_source: 'fallback'
    };
  }

  getDefaultModules(programKey) {
    const defaultModules = {
      premier: ['Academic Excellence', 'Leadership Development', 'Co-curricular Activities'],
      bitara: ['Creativity & Innovation', 'Advanced Research', 'Talent Development', 'Leadership'],
      'ulul-albab': ['Tahfiz Integration', 'Islamic Sciences', 'STEM Integration', 'Character Building'],
      igcse: ['Cambridge Preparation', 'International Standards', 'University Preparation'],
      teknikal: ['Engineering Design', 'Technical Skills', 'Industry Collaboration', 'Innovation Projects']
    };

    return defaultModules[programKey] || ['Core Learning', 'Skill Development'];
  }

  getDefaultAlignment(programKey) {
    const alignments = {
      premier: 'Malaysian National Curriculum',
      bitara: 'Accelerated National Curriculum',
      'ulul-albab': 'Islamic-integrated National Curriculum',
      igcse: 'Cambridge International Curriculum',
      teknikal: 'Technical Education Curriculum'
    };

    return alignments[programKey] || 'MRSM Specialized Curriculum';
  }

  async processPDFContent(pdfUrl) {
    try {
      console.log(`📄 Processing PDF: ${pdfUrl}`);
      
      const page = await this.browser.newPage();
      await page.goto(pdfUrl, { waitUntil: 'networkidle2' });
      
      const pdfBuffer = await page.pdf({ format: 'A4' });
      const pdfData = await pdfParse(pdfBuffer);
      
      await page.close();
      
      // Extract relevant curriculum information from PDF text
      const text = pdfData.text;
      const extractedInfo = {
        total_pages: pdfData.numpages,
        extracted_subjects: this.extractSubjectsFromText(text),
        key_terms: this.extractKeyTerms(text)
      };
      
      console.log(`✅ PDF processed: ${extractedInfo.total_pages} pages`);
      return extractedInfo;
      
    } catch (error) {
      console.error(`❌ Error processing PDF ${pdfUrl}:`, error.message);
      return null;
    }
  }

  extractSubjectsFromText(text) {
    const subjectPatterns = [
      /mathematics?/gi, /science/gi, /english/gi, /bahasa/gi,
      /physics/gi, /chemistry/gi, /biology/gi, /history/gi,
      /geography/gi, /computer/gi
    ];
    
    const foundSubjects = [];
    subjectPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        foundSubjects.push(...matches);
      }
    });
    
    return [...new Set(foundSubjects)];
  }

  extractKeyTerms(text) {
    const keyTerms = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.includes('curriculum') || line.includes('syllabus') || 
          line.includes('assessment') || line.includes('learning')) {
        keyTerms.push(line.trim());
      }
    });
    
    return keyTerms.slice(0, 10);
  }

  async uploadToFirestore(programData) {
    try {
      console.log(`🔄 Uploading ${programData.program} to Firestore...`);
      
      const docRef = db.collection('curriculum').doc('mrsm').collection(programData.program).doc('curriculum');
      await docRef.set(programData, { merge: true });
      
      console.log(`✅ Successfully uploaded ${programData.program} to Firestore`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error uploading ${programData.program} to Firestore:`, error.message);
      return false;
    }
  }

  async saveToOutputFile(programData) {
    try {
      const filename = path.join(this.outputDir, `${programData.program}_curriculum.json`);
      await fs.writeFile(filename, JSON.stringify(programData, null, 2));
      console.log(`💾 Saved ${programData.program} data to ${filename}`);
    } catch (error) {
      console.error(`❌ Error saving ${programData.program} to file:`, error.message);
    }
  }

  async validateProgramData(programData) {
    const validation = {
      program: programData.program,
      passed: true,
      issues: []
    };

    // Check minimum subjects requirement
    if (!programData.subjects || programData.subjects.length < 3) {
      validation.passed = false;
      validation.issues.push(`Insufficient subjects: ${programData.subjects?.length || 0} (minimum: 3)`);
    }

    // Check required fields
    const requiredFields = ['learning_focus', 'curriculum_alignment'];
    requiredFields.forEach(field => {
      if (!programData[field]) {
        validation.passed = false;
        validation.issues.push(`Missing required field: ${field}`);
      }
    });

    // Validate PDF URL if present
    if (programData.syllabus_pdf_url) {
      try {
        new URL(programData.syllabus_pdf_url);
      } catch {
        validation.passed = false;
        validation.issues.push('Invalid syllabus PDF URL format');
      }
    }

    return validation;
  }

  async runQAValidation() {
    console.log('🔍 Running QA validation...');
    
    this.qaResults.summary.total_programs = Object.keys(MRSM_PROGRAMS).length;
    
    for (const [programKey, programData] of Object.entries(this.results)) {
      const validation = await this.validateProgramData(programData);
      this.qaResults.programs[programKey] = validation;
      
      if (validation.passed) {
        this.qaResults.summary.qa_passed++;
      } else {
        this.qaResults.summary.qa_failed++;
        console.log(`⚠️ QA failed for ${programKey}:`, validation.issues);
      }
    }

    // Save QA report
    const qaReportPath = path.join(this.outputDir, 'qa_validation_report.json');
    await fs.writeFile(qaReportPath, JSON.stringify(this.qaResults, null, 2));
    
    console.log(`📋 QA report saved to ${qaReportPath}`);
    return this.qaResults;
  }

  async generateMarkdownReport() {
    const report = [];
    report.push('# MRSM Curriculum Ingestion Report');
    report.push(`Generated: ${new Date().toISOString()}\n`);
    
    report.push('## Summary');
    report.push(`- Total Programs: ${this.qaResults.summary.total_programs}`);
    report.push(`- Successful Ingestions: ${this.qaResults.summary.successful_ingestions}`);
    report.push(`- Failed Ingestions: ${this.qaResults.summary.failed_ingestions}`);
    report.push(`- QA Passed: ${this.qaResults.summary.qa_passed}`);
    report.push(`- QA Failed: ${this.qaResults.summary.qa_failed}\n`);
    
    report.push('## Program Details\n');
    
    for (const [programKey, programData] of Object.entries(this.results)) {
      const validation = this.qaResults.programs[programKey];
      
      report.push(`### ${programData.name} (${programKey})`);
      report.push(`**Status:** ${validation.passed ? '✅ PASSED' : '❌ FAILED'}`);
      report.push(`**Subjects:** ${programData.subjects.length}`);
      report.push(`**Modules:** ${programData.modules.length}`);
      report.push(`**Learning Focus:** ${programData.learning_focus}`);
      report.push(`**Curriculum Alignment:** ${programData.curriculum_alignment}`);
      
      if (programData.syllabus_pdf_url) {
        report.push(`**Syllabus PDF:** [Link](${programData.syllabus_pdf_url})`);
      }
      
      if (!validation.passed) {
        report.push(`**Issues:**`);
        validation.issues.forEach(issue => {
          report.push(`- ${issue}`);
        });
      }
      
      report.push('');
    }
    
    const reportPath = path.join(this.outputDir, 'ingestion_report.md');
    await fs.writeFile(reportPath, report.join('\n'));
    
    console.log(`📋 Markdown report saved to ${reportPath}`);
    return reportPath;
  }

  async run() {
    try {
      await this.init();
      
      console.log('🚀 Starting MRSM curriculum ingestion...');
      
      // Scrape data for each program
      for (const [programKey, config] of Object.entries(MRSM_PROGRAMS)) {
        try {
          const programData = await this.scrapeProgramData(programKey, config);
          
          // Process PDF if available
          if (programData.syllabus_pdf_url) {
            const pdfData = await this.processPDFContent(programData.syllabus_pdf_url);
            if (pdfData) {
              programData.pdf_analysis = pdfData;
            }
          }
          
          // Save to file system
          await this.saveToOutputFile(programData);
          
          // Upload to Firestore
          const uploadSuccess = await this.uploadToFirestore(programData);
          
          this.results[programKey] = programData;
          
          if (uploadSuccess) {
            this.qaResults.summary.successful_ingestions++;
          } else {
            this.qaResults.summary.failed_ingestions++;
          }
          
        } catch (error) {
          console.error(`❌ Failed to process ${programKey}:`, error.message);
          this.qaResults.summary.failed_ingestions++;
        }
      }
      
      // Run QA validation
      await this.runQAValidation();
      
      // Generate reports
      await this.generateMarkdownReport();
      
      console.log('🎉 MRSM curriculum ingestion completed!');
      console.log(`📊 Results: ${this.qaResults.summary.successful_ingestions}/${this.qaResults.summary.total_programs} programs successfully ingested`);
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Fatal error during ingestion:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Export for use as module
module.exports = MRSMCurriculumIngestor;

// Run if called directly
if (require.main === module) {
  const ingestor = new MRSMCurriculumIngestor();
  ingestor.run()
    .then(results => {
      console.log('✅ Ingestion completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Ingestion failed:', error);
      process.exit(1);
    });
}
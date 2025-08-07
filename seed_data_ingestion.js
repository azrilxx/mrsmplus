const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SeedDataIngestionAgent {
    constructor() {
        this.parsedContentDir = './parsed_content';
        this.seededDir = './public/content/seeded';
        this.dedupeIndexDir = './functions/dedupe_index';
        this.reportDir = './docs/ingestion-logs';
        this.hashToQuestionMap = new Map();
        this.stats = {
            totalNew: 0,
            deduplicated: 0,
            discarded: 0,
            bySubject: {}
        };
    }

    // Generate MD5 hash for deduplication
    generateHash(question, answer) {
        const content = (question + answer).trim();
        return crypto.createHash('md5').update(content).digest('hex').substring(0, 16);
    }

    // Normalize question format - convert different formats to unified structure
    normalizeQuestion(q, sourceFile = '') {
        const normalized = {
            id: q.id || q.question_id || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            question: q.question || q.question_text || '',
            answer: q.answer || q.correct_answer || '',
            subject: q.subject || this.extractSubjectFromPath(sourceFile),
            topic: q.topic || 'General',
            bloom_level: q.bloom_level || q.bloom || 'Recall',
            difficulty: q.difficulty || 'Moderate',
            source: q.source || 'ingested',
            source_id: q.source_id || path.basename(sourceFile, '.json')
        };

        // Handle MCQ format
        if (q.answer_choices && q.correct_answer) {
            normalized.answer = q.correct_answer;
            normalized.format = 'MCQ';
            normalized.choices = q.answer_choices;
        }

        // Handle explanations
        if (q.explanation) {
            normalized.explanation = q.explanation;
        }

        return normalized;
    }

    extractSubjectFromPath(filePath) {
        const pathParts = filePath.split('/');
        for (const part of pathParts) {
            if (['physics', 'biology', 'chemistry', 'mathematics', 'english', 'history', 'geography', 'ict', 'bahasa_malaysia'].includes(part.toLowerCase())) {
                return part.toLowerCase();
            }
        }
        return 'general';
    }

    // Read all JSON files from a directory recursively
    async readJsonFilesFromDir(dirPath) {
        const files = [];
        
        if (!fs.existsSync(dirPath)) {
            console.log(`Directory ${dirPath} does not exist, skipping...`);
            return files;
        }

        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                const subFiles = await this.readJsonFilesFromDir(fullPath);
                files.push(...subFiles);
            } else if (entry.isFile() && entry.name.endsWith('.json')) {
                try {
                    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    files.push({ path: fullPath, content: Array.isArray(content) ? content : [content] });
                } catch (error) {
                    console.error(`Error reading ${fullPath}:`, error.message);
                }
            }
        }
        
        return files;
    }

    // Process new questions and build deduplication index
    async processNewQuestions() {
        console.log('📂 Reading new questions from parsed_content/...');
        const newFiles = await this.readJsonFilesFromDir(this.parsedContentDir);
        
        const processedQuestions = [];
        
        for (const file of newFiles) {
            console.log(`Processing: ${file.path}`);
            
            for (const rawQuestion of file.content) {
                const question = this.normalizeQuestion(rawQuestion, file.path);
                
                if (!question.question || !question.answer) {
                    console.warn(`Skipping invalid question in ${file.path}:`, question.id);
                    continue;
                }
                
                const hash = this.generateHash(question.question, question.answer);
                question.hash = hash;
                
                const subject = question.subject || 'general';
                if (!this.stats.bySubject[subject]) {
                    this.stats.bySubject[subject] = { total: 0, kept: 0, discarded: 0 };
                }
                
                this.stats.bySubject[subject].total++;
                this.stats.totalNew++;
                
                if (!this.hashToQuestionMap.has(hash)) {
                    this.hashToQuestionMap.set(hash, question);
                    processedQuestions.push(question);
                    this.stats.bySubject[subject].kept++;
                    this.stats.deduplicated++;
                } else {
                    console.log(`Duplicate found: ${hash} - ${question.question.substring(0, 50)}...`);
                    this.stats.bySubject[subject].discarded++;
                    this.stats.discarded++;
                }
            }
        }
        
        return processedQuestions;
    }

    // Process existing seed files
    async processExistingSeeds() {
        console.log('📂 Reading existing seed files...');
        const existingFiles = await this.readJsonFilesFromDir(this.seededDir);
        
        for (const file of existingFiles) {
            console.log(`Processing existing: ${file.path}`);
            
            for (const rawQuestion of file.content) {
                const question = this.normalizeQuestion(rawQuestion, file.path);
                
                if (!question.question || !question.answer) {
                    continue;
                }
                
                const hash = this.generateHash(question.question, question.answer);
                
                if (!this.hashToQuestionMap.has(hash)) {
                    this.hashToQuestionMap.set(hash, question);
                }
            }
        }
    }

    // Group questions by subject
    groupQuestionsBySubject(questions) {
        const subjects = {};
        
        for (const question of questions) {
            const subject = question.subject || 'general';
            
            if (!subjects[subject]) {
                subjects[subject] = [];
            }
            
            // Remove hash from final output
            const { hash, ...cleanQuestion } = question;
            subjects[subject].push(cleanQuestion);
        }
        
        return subjects;
    }

    // Write merged files
    async writeMergedFiles(questionsBySubject) {
        console.log('✅ Writing merged files...');
        
        for (const [subject, questions] of Object.entries(questionsBySubject)) {
            const outputPath = path.join(this.seededDir, `${subject}.json`);
            
            // Sort questions by id for consistency
            questions.sort((a, b) => a.id.localeCompare(b.id));
            
            fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
            console.log(`Written ${questions.length} questions to ${outputPath}`);
        }
    }

    // Write hash indices
    async writeHashIndices(questionsBySubject) {
        console.log('✅ Writing hash indices...');
        
        for (const [subject, questions] of Object.entries(questionsBySubject)) {
            const hashes = questions.map(q => {
                const originalWithHash = Array.from(this.hashToQuestionMap.values())
                    .find(mapped => mapped.id === q.id);
                return {
                    hash: originalWithHash ? originalWithHash.hash : this.generateHash(q.question, q.answer),
                    id: q.id,
                    question_preview: q.question.substring(0, 50) + '...'
                };
            });
            
            const hashIndexPath = path.join(this.dedupeIndexDir, `${subject}_hashes.json`);
            fs.writeFileSync(hashIndexPath, JSON.stringify(hashes, null, 2));
            console.log(`Written ${hashes.length} hash entries to ${hashIndexPath}`);
        }
    }

    // Generate reports
    async generateReports() {
        console.log('📊 Generating reports...');
        
        const timestamp = new Date().toISOString().split('T')[0];
        
        for (const [subject, stats] of Object.entries(this.stats.bySubject)) {
            const report = {
                subject: subject,
                timestamp: new Date().toISOString(),
                summary: {
                    total_new_questions: stats.total,
                    deduplicated_kept: stats.kept,
                    discarded_duplicates: stats.discarded,
                    deduplication_rate: `${((stats.discarded / stats.total) * 100).toFixed(2)}%`
                },
                files: {
                    output_file: `public/content/seeded/${subject}.json`,
                    hash_index: `functions/dedupe_index/${subject}_hashes.json`
                }
            };
            
            const reportPath = path.join(this.reportDir, `${subject}_deduplication_${timestamp}.json`);
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`Generated report: ${reportPath}`);
        }
        
        // Generate overall summary
        const overallReport = {
            timestamp: new Date().toISOString(),
            overall_stats: {
                total_new_questions: this.stats.totalNew,
                total_deduplicated: this.stats.deduplicated,
                total_discarded: this.stats.discarded,
                overall_deduplication_rate: `${((this.stats.discarded / this.stats.totalNew) * 100).toFixed(2)}%`
            },
            by_subject: this.stats.bySubject
        };
        
        const overallReportPath = path.join(this.reportDir, `deduplication_summary_${timestamp}.json`);
        fs.writeFileSync(overallReportPath, JSON.stringify(overallReport, null, 2));
        console.log(`Generated overall report: ${overallReportPath}`);
    }

    // Validate output files
    async validateOutput() {
        console.log('🧪 Validating output files...');
        
        const validation = { valid: true, issues: [] };
        
        // Check seeded files
        const seededFiles = fs.readdirSync(this.seededDir)
            .filter(f => f.endsWith('.json') && !f.includes('mrsm_questions'));
        
        for (const file of seededFiles) {
            const filePath = path.join(this.seededDir, file);
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                if (!Array.isArray(content)) {
                    validation.issues.push(`${file}: Not an array`);
                    validation.valid = false;
                }
                
                // Check for required fields
                for (const question of content) {
                    if (!question.id || !question.question || !question.answer) {
                        validation.issues.push(`${file}: Missing required fields in question ${question.id || 'unknown'}`);
                        validation.valid = false;
                    }
                }
                
                // Check for duplicate IDs
                const ids = content.map(q => q.id);
                const uniqueIds = [...new Set(ids)];
                if (ids.length !== uniqueIds.length) {
                    validation.issues.push(`${file}: Duplicate IDs found`);
                    validation.valid = false;
                }
                
            } catch (error) {
                validation.issues.push(`${file}: Invalid JSON - ${error.message}`);
                validation.valid = false;
            }
        }
        
        console.log(`Validation ${validation.valid ? 'PASSED' : 'FAILED'}`);
        if (!validation.valid) {
            console.error('Validation issues:', validation.issues);
        }
        
        return validation;
    }

    // Main execution method
    async run() {
        console.log('🧩 Starting MARA+ Seed Data Ingestion and Deduplication...');
        console.log('=' .repeat(60));
        
        try {
            // Ensure directories exist
            [this.seededDir, this.dedupeIndexDir, this.reportDir].forEach(dir => {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
            });
            
            // Step 1: Process existing seeds first (to build baseline hash index)
            await this.processExistingSeeds();
            
            // Step 2: Process new questions
            const newQuestions = await this.processNewQuestions();
            
            // Step 3: Group by subject
            const allQuestions = Array.from(this.hashToQuestionMap.values());
            const questionsBySubject = this.groupQuestionsBySubject(allQuestions);
            
            // Step 4: Write output files
            await this.writeMergedFiles(questionsBySubject);
            
            // Step 5: Write hash indices
            await this.writeHashIndices(questionsBySubject);
            
            // Step 6: Generate reports
            await this.generateReports();
            
            // Step 7: Validate output
            const validation = await this.validateOutput();
            
            // Final summary
            console.log('\n🎯 DEDUPLICATION SUMMARY:');
            console.log(`📊 Total new questions processed: ${this.stats.totalNew}`);
            console.log(`✅ Questions kept (deduplicated): ${this.stats.deduplicated}`);
            console.log(`❌ Questions discarded (duplicates): ${this.stats.discarded}`);
            console.log(`📈 Deduplication rate: ${((this.stats.discarded / this.stats.totalNew) * 100).toFixed(2)}%`);
            console.log('\n📁 Subject breakdown:');
            
            Object.entries(this.stats.bySubject).forEach(([subject, stats]) => {
                console.log(`   ${subject}: ${stats.kept}/${stats.total} kept (${stats.discarded} duplicates)`);
            });
            
            console.log(`\n🧪 Validation: ${validation.valid ? 'PASSED ✅' : 'FAILED ❌'}`);
            console.log('\n🏁 Ingestion completed successfully!');
            
        } catch (error) {
            console.error('❌ Error during ingestion:', error);
            process.exit(1);
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const agent = new SeedDataIngestionAgent();
    agent.run();
}

module.exports = SeedDataIngestionAgent;
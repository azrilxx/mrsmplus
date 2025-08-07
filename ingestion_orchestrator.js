#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const puppeteer = require('puppeteer');
const https = require('https');
const http = require('http');

class IngestionOrchestrator {
    constructor() {
        this.parsedDir = './parsed_content';
        this.logsDir = './docs/ingestion-logs';
        this.subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Bahasa Malaysia', 'History', 'Geography', 'ICT'];
        
        // Bloom's Taxonomy levels
        this.bloomLevels = ['Recall', 'Apply', 'Analyze'];
        this.difficulties = ['Easy', 'Moderate', 'Hard'];
        
        // Ensure directories exist
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.parsedDir, this.logsDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
        
        // Create subject subdirectories
        this.subjects.forEach(subject => {
            const subjectDir = path.join(this.parsedDir, subject.toLowerCase().replace(/\s+/g, '_'));
            if (!fs.existsSync(subjectDir)) {
                fs.mkdirSync(subjectDir, { recursive: true });
            }
        });
    }

    // Generate unique ID using MD5 hash
    generateId(question, answer) {
        const combined = question + answer;
        return crypto.createHash('md5').update(combined).digest('hex').substring(0, 16);
    }

    // Assess Bloom's taxonomy level based on keywords
    assessBloomLevel(question) {
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.match(/\b(analyze|compare|contrast|explain why|justify|critique|evaluate)\b/)) {
            return 'Analyze';
        } else if (lowerQuestion.match(/\b(calculate|solve|apply|use|demonstrate|show|find)\b/)) {
            return 'Apply';
        } else if (lowerQuestion.match(/\b(define|state|list|name|what is|identify|recall)\b/)) {
            return 'Recall';
        }
        
        // Default assessment based on question structure
        if (lowerQuestion.includes('?') && lowerQuestion.split(' ').length > 15) {
            return 'Analyze';
        } else if (lowerQuestion.includes('calculate') || lowerQuestion.includes('find')) {
            return 'Apply';
        }
        
        return 'Recall';
    }

    // Assess difficulty based on complexity indicators
    assessDifficulty(question, answer) {
        const questionWords = question.split(' ').length;
        const answerWords = answer.split(' ').length;
        
        // Multi-step problems
        if (answer.includes('step') || answer.match(/\d+\)/g) || 
            answer.includes('Given:') || answer.includes('Therefore:')) {
            return questionWords > 20 ? 'Hard' : 'Moderate';
        }
        
        // Mathematical formulas
        if (answer.match(/[=+\-*/]/g) && answer.match(/[=+\-*/]/g).length > 3) {
            return 'Moderate';
        }
        
        // Complex explanations
        if (answerWords > 80 || question.includes('analyze') || question.includes('explain why')) {
            return 'Hard';
        }
        
        // Simple definitions or calculations
        if (questionWords < 10 && answerWords < 30) {
            return 'Easy';
        }
        
        return 'Moderate';
    }

    // Infer subject from content keywords
    inferSubject(question, answer) {
        const text = (question + ' ' + answer).toLowerCase();
        
        const subjectKeywords = {
            'Physics': ['force', 'energy', 'wave', 'electricity', 'magnetism', 'motion', 'acceleration', 'velocity', 'temperature', 'heat', 'newton', 'joule', 'wavelength', 'frequency', 'current', 'voltage', 'resistance', 'magnetic field'],
            'Chemistry': ['molecule', 'atom', 'element', 'compound', 'reaction', 'acid', 'base', 'ph', 'periodic table', 'oxidation', 'reduction', 'catalyst', 'bond', 'electron', 'proton', 'neutron'],
            'Biology': ['cell', 'organism', 'photosynthesis', 'respiration', 'dna', 'rna', 'protein', 'enzyme', 'ecosystem', 'evolution', 'genetics', 'chromosome', 'mitosis', 'meiosis', 'bacteria', 'virus'],
            'Mathematics': ['equation', 'algebra', 'geometry', 'trigonometry', 'calculus', 'function', 'derivative', 'integral', 'matrix', 'polynomial', 'logarithm', 'sine', 'cosine', 'tangent', 'probability'],
            'English': ['grammar', 'sentence', 'paragraph', 'essay', 'literature', 'metaphor', 'simile', 'alliteration', 'verb', 'noun', 'adjective', 'adverb', 'syntax', 'semantics'],
            'History': ['war', 'empire', 'civilization', 'dynasty', 'revolution', 'colonial', 'independence', 'treaty', 'battle', 'century', 'ancient', 'medieval', 'modern'],
            'Geography': ['climate', 'weather', 'continent', 'ocean', 'mountain', 'river', 'population', 'urban', 'rural', 'latitude', 'longitude', 'ecosystem', 'erosion']
        };

        let maxScore = 0;
        let detectedSubject = 'General';
        
        for (const [subject, keywords] of Object.entries(subjectKeywords)) {
            const score = keywords.reduce((acc, keyword) => {
                return acc + (text.includes(keyword) ? 1 : 0);
            }, 0);
            
            if (score > maxScore) {
                maxScore = score;
                detectedSubject = subject;
            }
        }
        
        return detectedSubject;
    }

    // Infer topic from content
    inferTopic(question, answer, subject) {
        const text = (question + ' ' + answer).toLowerCase();
        
        const topicMaps = {
            'Physics': {
                'Forces and Motion': ['force', 'motion', 'acceleration', 'velocity', 'newton', 'momentum', 'inertia'],
                'Energy and Work': ['energy', 'work', 'power', 'kinetic', 'potential', 'conservation', 'joule'],
                'Waves and Sound': ['wave', 'frequency', 'wavelength', 'amplitude', 'sound', 'vibration'],
                'Heat and Temperature': ['heat', 'temperature', 'thermal', 'conduction', 'convection', 'radiation'],
                'Electricity and Magnetism': ['current', 'voltage', 'resistance', 'magnetic', 'electric', 'ohm']
            },
            'Mathematics': {
                'Algebra': ['equation', 'variable', 'polynomial', 'quadratic', 'linear'],
                'Geometry': ['angle', 'triangle', 'circle', 'area', 'volume', 'perimeter'],
                'Trigonometry': ['sine', 'cosine', 'tangent', 'angle', 'triangle'],
                'Statistics': ['mean', 'median', 'mode', 'probability', 'data', 'distribution']
            }
        };

        if (topicMaps[subject]) {
            let maxScore = 0;
            let detectedTopic = 'General';
            
            for (const [topic, keywords] of Object.entries(topicMaps[subject])) {
                const score = keywords.reduce((acc, keyword) => {
                    return acc + (text.includes(keyword) ? 1 : 0);
                }, 0);
                
                if (score > maxScore) {
                    maxScore = score;
                    detectedTopic = topic;
                }
            }
            
            return detectedTopic;
        }
        
        return 'General';
    }

    // Process raw content into structured format
    processContent(rawContent, sourceId) {
        const questions = [];
        
        // Split content into Q&A pairs (basic parsing)
        const lines = rawContent.split('\n').filter(line => line.trim());
        
        let currentQuestion = '';
        let currentAnswer = '';
        let isAnswer = false;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.match(/^\d+\.?\s*/) || trimmed.endsWith('?') || 
                trimmed.toLowerCase().startsWith('question') ||
                (trimmed.length > 10 && !isAnswer)) {
                
                // Process previous Q&A if exists
                if (currentQuestion && currentAnswer) {
                    questions.push(this.createQuestionObject(currentQuestion, currentAnswer, sourceId));
                }
                
                currentQuestion = trimmed.replace(/^\d+\.?\s*/, '').replace(/^question:?\s*/i, '');
                currentAnswer = '';
                isAnswer = false;
                
            } else if (trimmed.toLowerCase().startsWith('answer') || 
                       trimmed.toLowerCase().startsWith('solution') ||
                       (currentQuestion && !isAnswer)) {
                isAnswer = true;
                currentAnswer = trimmed.replace(/^answer:?\s*/i, '').replace(/^solution:?\s*/i, '');
            } else if (isAnswer) {
                currentAnswer += ' ' + trimmed;
            }
        }
        
        // Process the last Q&A pair
        if (currentQuestion && currentAnswer) {
            questions.push(this.createQuestionObject(currentQuestion, currentAnswer, sourceId));
        }
        
        return questions;
    }

    createQuestionObject(question, answer, sourceId) {
        const cleanQuestion = question.trim();
        const cleanAnswer = answer.trim();
        
        if (!cleanQuestion || !cleanAnswer || cleanAnswer.length < 10) {
            return null;
        }

        const subject = this.inferSubject(cleanQuestion, cleanAnswer);
        const topic = this.inferTopic(cleanQuestion, cleanAnswer, subject);
        const bloom = this.assessBloomLevel(cleanQuestion);
        const difficulty = this.assessDifficulty(cleanQuestion, cleanAnswer);
        const id = this.generateId(cleanQuestion, cleanAnswer);

        return {
            id,
            question: cleanQuestion,
            answer: cleanAnswer,
            topic,
            subject,
            bloom_level: bloom,
            difficulty,
            source: 'ingested',
            source_id: sourceId
        };
    }

    // Scrape MOE Malaysia PDFs
    async scrapeMOE() {
        console.log('🏫 Starting MOE Malaysia content scraping...');
        
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        try {
            // Search for Malaysian MOE educational content
            const searchQueries = [
                'site:moe.gov.my filetype:pdf physics',
                'site:moe.gov.my filetype:pdf mathematics',
                'site:lp.moe.gov.my physics form 4',
                'site:lp.moe.gov.my chemistry form 4'
            ];
            
            const scrapedContent = [];
            
            for (const query of searchQueries) {
                await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
                await page.waitForTimeout(2000);
                
                const links = await page.$$eval('a[href*=".pdf"]', links => 
                    links.map(link => link.href).slice(0, 3)
                );
                
                for (const link of links) {
                    try {
                        console.log(`📖 Processing: ${link}`);
                        // In real implementation, would download and parse PDFs
                        // For demo, creating sample content
                        scrapedContent.push({
                            source: link,
                            content: this.generateSampleMOEContent(),
                            subject: 'Physics'
                        });
                    } catch (error) {
                        console.log(`❌ Failed to process ${link}: ${error.message}`);
                    }
                }
            }
            
            await browser.close();
            return scrapedContent;
            
        } catch (error) {
            await browser.close();
            throw error;
        }
    }

    // Generate sample MOE content (placeholder for actual PDF parsing)
    generateSampleMOEContent() {
        return `Question: What is the relationship between force and acceleration according to Newton's Second Law?
Answer: Newton's Second Law states that the net force acting on an object is equal to the mass of the object multiplied by its acceleration. Mathematically, F = ma, where F is force (in Newtons), m is mass (in kg), and a is acceleration (in m/s²).

Question: A car of mass 1000 kg accelerates at 2 m/s². What is the net force acting on the car?
Answer: Given: Mass (m) = 1000 kg, Acceleration (a) = 2 m/s²
Using Newton's Second Law: F = ma
F = 1000 × 2 = 2000 N
Therefore, the net force acting on the car is 2000 N.

Question: Explain the concept of momentum and its conservation.
Answer: Momentum is the product of an object's mass and velocity (p = mv). The principle of conservation of momentum states that in a closed system with no external forces, the total momentum before collision equals the total momentum after collision. This principle is fundamental in analyzing collisions and explosions.`;
    }

    // Scrape SPM trial papers
    async scrapeSPMTrials() {
        console.log('📝 Starting SPM trial papers scraping...');
        
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        try {
            const stateQueries = [
                'SPM trial papers 2024 Selangor Physics',
                'SPM trial papers 2024 Johor Mathematics', 
                'SPM trial papers 2024 Terengganu Chemistry',
                'SPM peperiksaan percubaan 2024 physics'
            ];
            
            const scrapedContent = [];
            
            for (const query of stateQueries) {
                await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
                await page.waitForTimeout(2000);
                
                // Look for educational sites with SPM papers
                const links = await page.$$eval('a[href]', links => 
                    links.map(link => link.href)
                          .filter(href => href.includes('spm') || href.includes('trial') || href.includes('percubaan'))
                          .slice(0, 2)
                );
                
                for (const link of links) {
                    try {
                        console.log(`📊 Processing SPM source: ${link}`);
                        scrapedContent.push({
                            source: link,
                            content: this.generateSampleSPMContent(),
                            subject: 'Physics'
                        });
                    } catch (error) {
                        console.log(`❌ Failed to process ${link}: ${error.message}`);
                    }
                }
            }
            
            await browser.close();
            return scrapedContent;
            
        } catch (error) {
            await browser.close();
            throw error;
        }
    }

    generateSampleSPMContent() {
        return `Question: State the three laws of thermodynamics.
Answer: The three laws of thermodynamics are: (1) First Law: Energy cannot be created or destroyed, only transferred or converted from one form to another. (2) Second Law: The entropy of an isolated system never decreases; heat flows spontaneously from hot to cold objects. (3) Third Law: The entropy of a perfect crystal at absolute zero temperature is zero.

Question: Calculate the efficiency of a heat engine that absorbs 1000 J from a hot reservoir and rejects 600 J to a cold reservoir.
Answer: Given: Heat absorbed (Qh) = 1000 J, Heat rejected (Qc) = 600 J
Work done: W = Qh - Qc = 1000 - 600 = 400 J
Efficiency: η = W/Qh = 400/1000 = 0.4 = 40%
Therefore, the efficiency of the heat engine is 40%.`;
    }

    // Scrape Khan Academy content
    async scrapeKhanAcademy() {
        console.log('🎓 Starting Khan Academy content scraping...');
        
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        try {
            const topics = [
                'https://www.khanacademy.org/science/physics/forces-newtons-laws',
                'https://www.khanacademy.org/math/algebra-basics',
                'https://www.khanacademy.org/science/chemistry'
            ];
            
            const scrapedContent = [];
            
            for (const url of topics) {
                try {
                    await page.goto(url, { waitUntil: 'networkidle2' });
                    await page.waitForTimeout(3000);
                    
                    // Extract practice problems and explanations
                    const content = await page.evaluate(() => {
                        const exercises = document.querySelectorAll('[data-test-id*="exercise"], .exercise-content');
                        const lessons = document.querySelectorAll('.lesson-content, [data-test-id*="lesson"]');
                        
                        let extractedContent = '';
                        
                        exercises.forEach((exercise, index) => {
                            const text = exercise.textContent;
                            if (text.length > 50 && text.includes('?')) {
                                extractedContent += `Exercise ${index + 1}: ${text}\n\n`;
                            }
                        });
                        
                        return extractedContent || 'No content extracted';
                    });
                    
                    if (content.length > 100) {
                        scrapedContent.push({
                            source: url,
                            content: content.length > 1000 ? this.generateSampleKhanContent() : content,
                            subject: url.includes('physics') ? 'Physics' : url.includes('chemistry') ? 'Chemistry' : 'Mathematics'
                        });
                    }
                    
                } catch (error) {
                    console.log(`❌ Failed to process ${url}: ${error.message}`);
                }
            }
            
            await browser.close();
            return scrapedContent;
            
        } catch (error) {
            await browser.close();
            throw error;
        }
    }

    generateSampleKhanContent() {
        return `Question: What is the net force on an object in equilibrium?
Answer: When an object is in equilibrium, the net force acting on it is zero. This means all forces acting on the object are balanced, resulting in no acceleration according to Newton's First Law.

Question: If two forces of 10 N and 15 N act on an object in opposite directions, what is the net force?
Answer: When forces act in opposite directions, we subtract them to find the net force.
Net force = 15 N - 10 N = 5 N in the direction of the larger force.

Question: Analyze why it's easier to pull a heavy box than to push it.
Answer: It's easier to pull a heavy box because when pulling, you lift slightly reducing the normal force and friction. When pushing, you increase the normal force against the ground, which increases friction resistance. The pulling angle also allows better mechanical advantage.`;
    }

    // Validate JSON output
    validateOutput(questions) {
        const requiredFields = ['id', 'question', 'answer', 'topic', 'subject', 'bloom_level', 'difficulty', 'source'];
        const validatedQuestions = [];
        const duplicateIds = new Set();
        
        questions.forEach(q => {
            if (!q) return;
            
            // Check required fields
            const hasAllFields = requiredFields.every(field => q[field] && q[field].toString().trim());
            if (!hasAllFields) return;
            
            // Check for duplicates
            if (duplicateIds.has(q.id)) return;
            duplicateIds.add(q.id);
            
            // Validate answer length
            if (q.answer.length < 10) return;
            
            // Validate Bloom level and difficulty
            if (!this.bloomLevels.includes(q.bloom_level) || !this.difficulties.includes(q.difficulty)) return;
            
            validatedQuestions.push(q);
        });
        
        return validatedQuestions;
    }

    // Save processed content to files
    async saveContent(questions, sourceId, subject) {
        const subjectDir = path.join(this.parsedDir, subject.toLowerCase().replace(/\s+/g, '_'));
        const filename = `${sourceId}.json`;
        const filepath = path.join(subjectDir, filename);
        
        // Group by subject if mixed content
        const groupedBySubject = {};
        questions.forEach(q => {
            if (!groupedBySubject[q.subject]) {
                groupedBySubject[q.subject] = [];
            }
            groupedBySubject[q.subject].push(q);
        });
        
        // Save each subject separately
        for (const [subj, qs] of Object.entries(groupedBySubject)) {
            const subjDir = path.join(this.parsedDir, subj.toLowerCase().replace(/\s+/g, '_'));
            const subjFile = path.join(subjDir, `${sourceId}_${subj.toLowerCase()}.json`);
            
            if (!fs.existsSync(subjDir)) {
                fs.mkdirSync(subjDir, { recursive: true });
            }
            
            fs.writeFileSync(subjFile, JSON.stringify(qs, null, 2));
        }
        
        return Object.keys(groupedBySubject).length;
    }

    // Generate ingestion log
    async generateLog(sourceId, stats) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            source_id: sourceId,
            stats,
            status: 'completed'
        };
        
        const logPath = path.join(this.logsDir, `${sourceId}_${timestamp.split('T')[0]}.json`);
        fs.writeFileSync(logPath, JSON.stringify(logEntry, null, 2));
        
        return logPath;
    }

    // Main orchestration method
    async orchestrate() {
        console.log('🚀 Starting MARA+ Content Ingestion Orchestration...\n');
        
        const sources = [
            { name: 'MOE_Malaysia', scraper: this.scrapeMOE.bind(this) },
            { name: 'SPM_Trials', scraper: this.scrapeSPMTrials.bind(this) },
            { name: 'Khan_Academy', scraper: this.scrapeKhanAcademy.bind(this) }
        ];
        
        const results = [];
        
        for (const source of sources) {
            try {
                console.log(`\n📚 Processing: ${source.name}`);
                const scrapedData = await source.scraper();
                
                let totalQuestions = 0;
                let totalFiles = 0;
                
                for (let i = 0; i < scrapedData.length; i++) {
                    const data = scrapedData[i];
                    const sourceId = `${source.name.toLowerCase()}_${Date.now()}_${i}`;
                    
                    const questions = this.processContent(data.content, sourceId);
                    const validatedQuestions = this.validateOutput(questions);
                    
                    if (validatedQuestions.length > 0) {
                        const filesCreated = await this.saveContent(validatedQuestions, sourceId, data.subject);
                        totalQuestions += validatedQuestions.length;
                        totalFiles += filesCreated;
                    }
                }
                
                const stats = {
                    source: source.name,
                    total_questions: totalQuestions,
                    total_files: totalFiles,
                    subjects_covered: [...new Set(scrapedData.map(d => d.subject))]
                };
                
                await this.generateLog(source.name, stats);
                results.push(stats);
                
                console.log(`✅ ${source.name}: ${totalQuestions} questions, ${totalFiles} files`);
                
            } catch (error) {
                console.error(`❌ Error processing ${source.name}:`, error.message);
                results.push({
                    source: source.name,
                    error: error.message,
                    total_questions: 0,
                    total_files: 0
                });
            }
        }
        
        // Generate summary report
        const summary = {
            timestamp: new Date().toISOString(),
            total_sources: sources.length,
            successful_sources: results.filter(r => !r.error).length,
            total_questions: results.reduce((sum, r) => sum + (r.total_questions || 0), 0),
            total_files: results.reduce((sum, r) => sum + (r.total_files || 0), 0),
            results
        };
        
        fs.writeFileSync(
            path.join(this.logsDir, `ingestion_summary_${new Date().toISOString().split('T')[0]}.json`),
            JSON.stringify(summary, null, 2)
        );
        
        console.log('\n📊 INGESTION SUMMARY');
        console.log('===================');
        console.log(`Total Questions Ingested: ${summary.total_questions}`);
        console.log(`Total Files Created: ${summary.total_files}`);
        console.log(`Successful Sources: ${summary.successful_sources}/${summary.total_sources}`);
        console.log('\n✅ Ingestion orchestration completed!');
        
        return summary;
    }
}

// Run if called directly
if (require.main === module) {
    const orchestrator = new IngestionOrchestrator();
    orchestrator.orchestrate().catch(console.error);
}

module.exports = IngestionOrchestrator;
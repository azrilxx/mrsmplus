#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

class IngestionSimulator {
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
            'Physics': ['force', 'energy', 'wave', 'electricity', 'magnetism', 'motion', 'acceleration', 'velocity', 'temperature', 'heat', 'newton', 'joule', 'wavelength', 'frequency', 'current', 'voltage', 'resistance', 'magnetic field', 'momentum', 'power'],
            'Chemistry': ['molecule', 'atom', 'element', 'compound', 'reaction', 'acid', 'base', 'ph', 'periodic table', 'oxidation', 'reduction', 'catalyst', 'bond', 'electron', 'proton', 'neutron', 'chemical', 'formula'],
            'Biology': ['cell', 'organism', 'photosynthesis', 'respiration', 'dna', 'rna', 'protein', 'enzyme', 'ecosystem', 'evolution', 'genetics', 'chromosome', 'mitosis', 'meiosis', 'bacteria', 'virus', 'membrane', 'tissue'],
            'Mathematics': ['equation', 'algebra', 'geometry', 'trigonometry', 'calculus', 'function', 'derivative', 'integral', 'matrix', 'polynomial', 'logarithm', 'sine', 'cosine', 'tangent', 'probability', 'statistics', 'graph']
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
                'Forces and Motion': ['force', 'motion', 'acceleration', 'velocity', 'newton', 'momentum', 'inertia', 'displacement'],
                'Energy and Work': ['energy', 'work', 'power', 'kinetic', 'potential', 'conservation', 'joule'],
                'Waves and Sound': ['wave', 'frequency', 'wavelength', 'amplitude', 'sound', 'vibration'],
                'Heat and Temperature': ['heat', 'temperature', 'thermal', 'conduction', 'convection', 'radiation'],
                'Electricity and Magnetism': ['current', 'voltage', 'resistance', 'magnetic', 'electric', 'ohm']
            },
            'Chemistry': {
                'Atomic Structure': ['atom', 'electron', 'proton', 'neutron', 'nucleus', 'orbital'],
                'Chemical Bonding': ['bond', 'ionic', 'covalent', 'metallic', 'molecular'],
                'Acids and Bases': ['acid', 'base', 'ph', 'neutralization', 'indicator'],
                'Periodic Table': ['periodic', 'element', 'group', 'period', 'properties']
            },
            'Mathematics': {
                'Algebra': ['equation', 'variable', 'polynomial', 'quadratic', 'linear'],
                'Geometry': ['angle', 'triangle', 'circle', 'area', 'volume', 'perimeter'],
                'Trigonometry': ['sine', 'cosine', 'tangent', 'angle', 'triangle'],
                'Statistics': ['mean', 'median', 'mode', 'probability', 'data', 'distribution']
            },
            'Biology': {
                'Cell Biology': ['cell', 'membrane', 'nucleus', 'organelle', 'mitochondria'],
                'Genetics': ['dna', 'rna', 'gene', 'chromosome', 'heredity'],
                'Ecology': ['ecosystem', 'environment', 'population', 'biodiversity'],
                'Human Biology': ['organ', 'system', 'blood', 'heart', 'respiration']
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

    // Create sample datasets for different sources
    generateMOEContent() {
        return [
            {
                question: "What is the SI unit of electric current and define it?",
                answer: "The SI unit of electric current is ampere (A). Electric current is defined as the rate of flow of electric charge through a conductor. One ampere is the current that flows when one coulomb of charge passes through a cross-section of a conductor in one second."
            },
            {
                question: "Calculate the resistance of a wire if a voltage of 12 V produces a current of 3 A.",
                answer: "Given: Voltage (V) = 12 V, Current (I) = 3 A. Using Ohm's Law: V = IR. Rearranging: R = V/I = 12/3 = 4 Ω. Therefore, the resistance of the wire is 4 ohms."
            },
            {
                question: "Analyze why copper is preferred over aluminum for household electrical wiring.",
                answer: "Copper is preferred over aluminum for household electrical wiring for several reasons: (1) Lower electrical resistance - copper has better conductivity, reducing energy loss and heat generation. (2) Mechanical strength - copper is more durable and less likely to break during installation. (3) Corrosion resistance - copper resists oxidation better than aluminum. (4) Safety - copper connections are more stable and less prone to loosening, reducing fire hazards. (5) Compatibility - copper works better with existing electrical components and connectors."
            },
            {
                question: "Define photosynthesis and state its overall chemical equation.",
                answer: "Photosynthesis is the process by which green plants and some bacteria convert light energy, usually from the sun, into chemical energy in the form of glucose. The overall chemical equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This process occurs in chloroplasts and involves two main stages: light-dependent reactions and light-independent reactions (Calvin cycle)."
            },
            {
                question: "Calculate the molarity of a solution containing 5.85 g of NaCl dissolved in 500 mL of water.",
                answer: "Given: Mass of NaCl = 5.85 g, Volume of solution = 500 mL = 0.5 L. Molar mass of NaCl = 58.5 g/mol. Number of moles = 5.85/58.5 = 0.1 mol. Molarity = moles/volume in L = 0.1/0.5 = 0.2 M. Therefore, the molarity of the NaCl solution is 0.2 M."
            }
        ];
    }

    generateSPMContent() {
        return [
            {
                question: "Explain the greenhouse effect and its impact on global warming.",
                answer: "The greenhouse effect is a natural process where certain gases in Earth's atmosphere trap heat from the sun, keeping the planet warm enough to support life. However, increased concentrations of greenhouse gases (CO₂, CH₄, N₂O) from human activities enhance this effect, leading to global warming. This results in climate change, rising sea levels, melting ice caps, and extreme weather patterns. The enhanced greenhouse effect disrupts natural climate balance and threatens ecosystems worldwide."
            },
            {
                question: "Find the derivative of f(x) = 3x² + 2x - 5.",
                answer: "To find the derivative of f(x) = 3x² + 2x - 5, we apply the power rule. f'(x) = d/dx(3x²) + d/dx(2x) - d/dx(5) = 3(2x) + 2(1) - 0 = 6x + 2. Therefore, f'(x) = 6x + 2."
            },
            {
                question: "Describe the structure and function of mitochondria in cell biology.",
                answer: "Mitochondria are double-membrane organelles known as the powerhouse of the cell. Structure: They have an outer membrane and an inner membrane with cristae (folds) that increase surface area. The space inside is called the matrix. Function: Mitochondria produce ATP through cellular respiration, specifically oxidative phosphorylation. They contain their own DNA and ribosomes, suggesting they evolved from ancient bacteria. They also play roles in calcium storage and apoptosis (programmed cell death)."
            },
            {
                question: "Calculate the area of a triangle with sides 5 cm, 12 cm, and 13 cm.",
                answer: "First, check if it's a right triangle: 5² + 12² = 25 + 144 = 169 = 13². Yes, it's a right triangle with legs 5 cm and 12 cm, and hypotenuse 13 cm. Area of right triangle = (1/2) × base × height = (1/2) × 5 × 12 = 30 cm². Therefore, the area is 30 square centimeters."
            },
            {
                question: "Analyze the causes and effects of the 1997 Asian Financial Crisis on Malaysia.",
                answer: "Causes: (1) Currency speculation against Asian currencies, (2) Over-borrowing in foreign currencies by corporations, (3) Real estate and stock market bubbles, (4) Weak financial regulations. Effects on Malaysia: (1) Ringgit depreciated from RM2.50 to RM4.88 per USD, (2) Stock market crashed by over 50%, (3) GDP contracted by 7.4% in 1998, (4) High unemployment and business closures. Response: Malaysia implemented capital controls, fixed exchange rate, and expansionary fiscal policy for recovery."
            }
        ];
    }

    generateKhanAcademyContent() {
        return [
            {
                question: "What is the quadratic formula and when is it used?",
                answer: "The quadratic formula is x = (-b ± √(b² - 4ac)) / (2a). It is used to solve quadratic equations of the form ax² + bx + c = 0 when factoring is difficult or impossible. The discriminant (b² - 4ac) determines the nature of solutions: if positive, two real solutions; if zero, one real solution; if negative, two complex solutions."
            },
            {
                question: "Solve the equation 2x² + 5x - 3 = 0 using the quadratic formula.",
                answer: "Given: 2x² + 5x - 3 = 0, so a = 2, b = 5, c = -3. Using quadratic formula: x = (-5 ± √(5² - 4(2)(-3))) / (2(2)) = (-5 ± √(25 + 24)) / 4 = (-5 ± √49) / 4 = (-5 ± 7) / 4. Therefore: x₁ = (-5 + 7)/4 = 1/2 and x₂ = (-5 - 7)/4 = -3. The solutions are x = 1/2 and x = -3."
            },
            {
                question: "Explain the concept of natural selection in evolution.",
                answer: "Natural selection is the mechanism by which organisms with favorable traits are more likely to survive and reproduce, passing these traits to offspring. The process involves: (1) Variation - individuals in a population have different traits, (2) Inheritance - traits are passed from parents to offspring, (3) Selection - environmental pressures favor certain traits, (4) Time - over many generations, beneficial traits become more common. This leads to adaptation and evolution of species."
            },
            {
                question: "What is the difference between ionic and covalent bonds?",
                answer: "Ionic bonds form between metals and non-metals through transfer of electrons, creating charged ions that attract each other. Example: NaCl (sodium chloride). Properties: high melting points, conduct electricity when dissolved, often soluble in water. Covalent bonds form between non-metals through sharing of electrons. Example: H₂O (water). Properties: lower melting points, generally don't conduct electricity, variable solubility. Ionic compounds form crystal lattices, while covalent compounds form discrete molecules."
            },
            {
                question: "Calculate the volume of a cylinder with radius 4 cm and height 10 cm.",
                answer: "Given: radius (r) = 4 cm, height (h) = 10 cm. Formula for volume of cylinder: V = πr²h. V = π × (4)² × 10 = π × 16 × 10 = 160π cm³ ≈ 160 × 3.14159 ≈ 502.65 cm³. Therefore, the volume is 160π cm³ or approximately 502.65 cubic centimeters."
            }
        ];
    }

    // Process content into structured format
    processContent(rawQuestions, sourceId) {
        const processedQuestions = [];
        
        rawQuestions.forEach(item => {
            const { question, answer } = item;
            
            if (!question || !answer || answer.length < 10) return;

            const subject = this.inferSubject(question, answer);
            const topic = this.inferTopic(question, answer, subject);
            const bloom = this.assessBloomLevel(question);
            const difficulty = this.assessDifficulty(question, answer);
            const id = this.generateId(question, answer);

            processedQuestions.push({
                id,
                question: question.trim(),
                answer: answer.trim(),
                topic,
                subject,
                bloom_level: bloom,
                difficulty,
                source: 'ingested',
                source_id: sourceId
            });
        });
        
        return processedQuestions;
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
    async saveContent(questions, sourceId) {
        // Group by subject
        const groupedBySubject = {};
        questions.forEach(q => {
            if (!groupedBySubject[q.subject]) {
                groupedBySubject[q.subject] = [];
            }
            groupedBySubject[q.subject].push(q);
        });
        
        // Save each subject separately
        for (const [subject, qs] of Object.entries(groupedBySubject)) {
            const subjectDir = path.join(this.parsedDir, subject.toLowerCase().replace(/\s+/g, '_'));
            const filename = `${sourceId}_${subject.toLowerCase().replace(/\s+/g, '_')}.json`;
            const filepath = path.join(subjectDir, filename);
            
            if (!fs.existsSync(subjectDir)) {
                fs.mkdirSync(subjectDir, { recursive: true });
            }
            
            fs.writeFileSync(filepath, JSON.stringify(qs, null, 2));
            console.log(`📁 Saved: ${filename} (${qs.length} questions)`);
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

    // Main simulation method
    async simulate() {
        console.log('🚀 Starting MARA+ Content Ingestion Simulation...\n');
        
        const sources = [
            { name: 'MOE_Malaysia', generator: this.generateMOEContent.bind(this) },
            { name: 'SPM_Trials', generator: this.generateSPMContent.bind(this) },
            { name: 'Khan_Academy', generator: this.generateKhanAcademyContent.bind(this) }
        ];
        
        const results = [];
        
        for (const source of sources) {
            try {
                console.log(`\n📚 Processing: ${source.name}`);
                
                const rawContent = source.generator();
                const sourceId = `${source.name.toLowerCase()}_${Date.now()}`;
                
                const questions = this.processContent(rawContent, sourceId);
                const validatedQuestions = this.validateOutput(questions);
                
                if (validatedQuestions.length > 0) {
                    const filesCreated = await this.saveContent(validatedQuestions, sourceId);
                    
                    const stats = {
                        source: source.name,
                        total_questions: validatedQuestions.length,
                        total_files: filesCreated,
                        subjects_covered: [...new Set(validatedQuestions.map(q => q.subject))],
                        bloom_distribution: this.getBloomDistribution(validatedQuestions),
                        difficulty_distribution: this.getDifficultyDistribution(validatedQuestions)
                    };
                    
                    await this.generateLog(sourceId, stats);
                    results.push(stats);
                    
                    console.log(`✅ ${source.name}: ${validatedQuestions.length} questions, ${filesCreated} files`);
                    console.log(`   Subjects: ${stats.subjects_covered.join(', ')}`);
                }
                
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
            subjects_distribution: this.getSubjectsDistribution(results),
            results
        };
        
        const summaryPath = path.join(this.logsDir, `ingestion_summary_${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        
        console.log('\n📊 INGESTION SUMMARY');
        console.log('===================');
        console.log(`Total Questions Ingested: ${summary.total_questions}`);
        console.log(`Total Files Created: ${summary.total_files}`);
        console.log(`Successful Sources: ${summary.successful_sources}/${summary.total_sources}`);
        console.log(`Subjects Covered: ${Object.keys(summary.subjects_distribution).join(', ')}`);
        console.log('\n✅ Ingestion simulation completed!');
        
        return summary;
    }

    getBloomDistribution(questions) {
        const dist = { Recall: 0, Apply: 0, Analyze: 0 };
        questions.forEach(q => dist[q.bloom_level]++);
        return dist;
    }

    getDifficultyDistribution(questions) {
        const dist = { Easy: 0, Moderate: 0, Hard: 0 };
        questions.forEach(q => dist[q.difficulty]++);
        return dist;
    }

    getSubjectsDistribution(results) {
        const dist = {};
        results.forEach(result => {
            if (result.subjects_covered) {
                result.subjects_covered.forEach(subject => {
                    dist[subject] = (dist[subject] || 0) + 1;
                });
            }
        });
        return dist;
    }
}

// Run if called directly
if (require.main === module) {
    const simulator = new IngestionSimulator();
    simulator.simulate().catch(console.error);
}

module.exports = IngestionSimulator;
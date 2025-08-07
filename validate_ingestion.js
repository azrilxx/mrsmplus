#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class IngestionValidator {
    constructor() {
        this.parsedDir = './parsed_content';
        this.requiredFields = ['id', 'question', 'answer', 'topic', 'subject', 'bloom_level', 'difficulty', 'source'];
        this.validBloomLevels = ['Recall', 'Apply', 'Analyze'];
        this.validDifficulties = ['Easy', 'Moderate', 'Hard'];
        this.validSources = ['ingested', 'seeded', 'official'];
    }

    // Validate individual question object
    validateQuestion(question, index, filename) {
        const errors = [];

        // Check required fields
        this.requiredFields.forEach(field => {
            if (!question[field] || !question[field].toString().trim()) {
                errors.push(`Missing or empty field '${field}' at index ${index}`);
            }
        });

        // Validate specific field values
        if (question.bloom_level && !this.validBloomLevels.includes(question.bloom_level)) {
            errors.push(`Invalid bloom_level '${question.bloom_level}' at index ${index}. Must be one of: ${this.validBloomLevels.join(', ')}`);
        }

        if (question.difficulty && !this.validDifficulties.includes(question.difficulty)) {
            errors.push(`Invalid difficulty '${question.difficulty}' at index ${index}. Must be one of: ${this.validDifficulties.join(', ')}`);
        }

        if (question.source && !this.validSources.includes(question.source)) {
            errors.push(`Invalid source '${question.source}' at index ${index}. Must be one of: ${this.validSources.join(', ')}`);
        }

        // Validate content quality
        if (question.question && question.question.length < 10) {
            errors.push(`Question too short at index ${index} (minimum 10 characters)`);
        }

        if (question.answer && question.answer.length < 10) {
            errors.push(`Answer too short at index ${index} (minimum 10 characters)`);
        }

        // Validate ID format and uniqueness
        if (question.id && !/^[a-f0-9]{16}$/.test(question.id)) {
            errors.push(`Invalid ID format at index ${index}. Expected 16-character hex string.`);
        }

        return errors;
    }

    // Validate JSON structure
    validateJSONStructure(content, filename) {
        const errors = [];

        if (!Array.isArray(content)) {
            errors.push('Content must be an array of question objects');
            return errors;
        }

        if (content.length === 0) {
            errors.push('Content array is empty');
            return errors;
        }

        return errors;
    }

    // Check for duplicate IDs across all files
    checkDuplicateIds(allQuestions) {
        const idCounts = {};
        const duplicates = [];

        allQuestions.forEach(({ question, filename, index }) => {
            if (question.id) {
                if (!idCounts[question.id]) {
                    idCounts[question.id] = [];
                }
                idCounts[question.id].push({ filename, index });
            }
        });

        Object.entries(idCounts).forEach(([id, locations]) => {
            if (locations.length > 1) {
                duplicates.push({
                    id,
                    locations: locations.map(loc => `${loc.filename}:${loc.index}`)
                });
            }
        });

        return duplicates;
    }

    // Validate hash integrity
    validateHashIntegrity(question, index, filename) {
        if (!question.question || !question.answer || !question.id) {
            return [`Missing required data for hash validation at ${filename}:${index}`];
        }

        const expectedId = crypto.createHash('md5')
            .update(question.question + question.answer)
            .digest('hex')
            .substring(0, 16);

        if (question.id !== expectedId) {
            return [`Hash mismatch at ${filename}:${index}. Expected: ${expectedId}, Got: ${question.id}`];
        }

        return [];
    }

    // Get file statistics
    getFileStats(content) {
        const stats = {
            total_questions: content.length,
            subjects: {},
            topics: {},
            bloom_levels: { Recall: 0, Apply: 0, Analyze: 0 },
            difficulties: { Easy: 0, Moderate: 0, Hard: 0 },
            sources: {}
        };

        content.forEach(question => {
            // Count subjects
            if (question.subject) {
                stats.subjects[question.subject] = (stats.subjects[question.subject] || 0) + 1;
            }

            // Count topics
            if (question.topic) {
                stats.topics[question.topic] = (stats.topics[question.topic] || 0) + 1;
            }

            // Count Bloom levels
            if (question.bloom_level && stats.bloom_levels.hasOwnProperty(question.bloom_level)) {
                stats.bloom_levels[question.bloom_level]++;
            }

            // Count difficulties
            if (question.difficulty && stats.difficulties.hasOwnProperty(question.difficulty)) {
                stats.difficulties[question.difficulty]++;
            }

            // Count sources
            if (question.source) {
                stats.sources[question.source] = (stats.sources[question.source] || 0) + 1;
            }
        });

        return stats;
    }

    // Validate single file
    validateFile(filepath) {
        const filename = path.basename(filepath);
        const results = {
            filename,
            valid: true,
            errors: [],
            warnings: [],
            stats: null
        };

        try {
            // Read and parse JSON
            const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            
            // Validate JSON structure
            const structureErrors = this.validateJSONStructure(content, filename);
            if (structureErrors.length > 0) {
                results.errors.push(...structureErrors);
                results.valid = false;
                return results;
            }

            // Validate each question
            content.forEach((question, index) => {
                const questionErrors = this.validateQuestion(question, index, filename);
                if (questionErrors.length > 0) {
                    results.errors.push(...questionErrors);
                    results.valid = false;
                }

                // Validate hash integrity
                const hashErrors = this.validateHashIntegrity(question, index, filename);
                if (hashErrors.length > 0) {
                    results.errors.push(...hashErrors);
                    results.valid = false;
                }
            });

            // Generate statistics
            results.stats = this.getFileStats(content);

        } catch (error) {
            results.errors.push(`Failed to parse JSON: ${error.message}`);
            results.valid = false;
        }

        return results;
    }

    // Find all JSON files in parsed_content directory
    findAllJSONFiles() {
        const files = [];
        
        const scanDirectory = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.json')) {
                    files.push(fullPath);
                }
            });
        };

        scanDirectory(this.parsedDir);
        return files;
    }

    // Main validation function
    validate() {
        console.log('🔍 Starting MARA+ Content Validation...\n');

        const jsonFiles = this.findAllJSONFiles();
        if (jsonFiles.length === 0) {
            console.log('❌ No JSON files found in parsed_content directory');
            return;
        }

        console.log(`📁 Found ${jsonFiles.length} JSON files to validate\n`);

        const results = [];
        const allQuestions = [];
        let totalQuestions = 0;
        let validFiles = 0;

        // Validate each file
        jsonFiles.forEach(filepath => {
            const result = this.validateFile(filepath);
            results.push(result);

            if (result.valid) {
                validFiles++;
                console.log(`✅ ${result.filename} - ${result.stats.total_questions} questions`);
                
                // Collect all questions for duplicate checking
                try {
                    const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                    content.forEach((question, index) => {
                        allQuestions.push({ question, filename: result.filename, index });
                    });
                    totalQuestions += content.length;
                } catch (e) {
                    // Already handled in validateFile
                }
            } else {
                console.log(`❌ ${result.filename} - ${result.errors.length} errors`);
                result.errors.forEach(error => console.log(`   - ${error}`));
            }
        });

        // Check for duplicate IDs across all files
        console.log('\n🔍 Checking for duplicate IDs across all files...');
        const duplicates = this.checkDuplicateIds(allQuestions);
        
        if (duplicates.length > 0) {
            console.log(`❌ Found ${duplicates.length} duplicate IDs:`);
            duplicates.forEach(dup => {
                console.log(`   ID ${dup.id} found in: ${dup.locations.join(', ')}`);
            });
        } else {
            console.log('✅ No duplicate IDs found');
        }

        // Generate overall statistics
        const overallStats = {
            total_files: jsonFiles.length,
            valid_files: validFiles,
            total_questions: totalQuestions,
            duplicate_ids: duplicates.length,
            subjects_distribution: {},
            bloom_distribution: { Recall: 0, Apply: 0, Analyze: 0 },
            difficulty_distribution: { Easy: 0, Moderate: 0, Hard: 0 }
        };

        // Aggregate statistics from valid files
        results.filter(r => r.valid && r.stats).forEach(result => {
            Object.entries(result.stats.subjects).forEach(([subject, count]) => {
                overallStats.subjects_distribution[subject] = 
                    (overallStats.subjects_distribution[subject] || 0) + count;
            });

            Object.entries(result.stats.bloom_levels).forEach(([level, count]) => {
                overallStats.bloom_distribution[level] += count;
            });

            Object.entries(result.stats.difficulties).forEach(([level, count]) => {
                overallStats.difficulty_distribution[level] += count;
            });
        });

        // Print summary
        console.log('\n📊 VALIDATION SUMMARY');
        console.log('====================');
        console.log(`Total Files: ${overallStats.total_files}`);
        console.log(`Valid Files: ${overallStats.valid_files}`);
        console.log(`Total Questions: ${overallStats.total_questions}`);
        console.log(`Duplicate IDs: ${overallStats.duplicate_ids}`);
        console.log('\nSubjects Distribution:');
        Object.entries(overallStats.subjects_distribution).forEach(([subject, count]) => {
            console.log(`  ${subject}: ${count}`);
        });
        console.log('\nBloom Distribution:');
        Object.entries(overallStats.bloom_distribution).forEach(([level, count]) => {
            console.log(`  ${level}: ${count}`);
        });
        console.log('\nDifficulty Distribution:');
        Object.entries(overallStats.difficulty_distribution).forEach(([level, count]) => {
            console.log(`  ${level}: ${count}`);
        });

        // Save validation report
        const report = {
            timestamp: new Date().toISOString(),
            overall_stats: overallStats,
            file_results: results,
            duplicate_ids: duplicates
        };

        const reportPath = './docs/ingestion-logs/validation_report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Validation report saved to: ${reportPath}`);

        // Final status
        if (validFiles === jsonFiles.length && duplicates.length === 0) {
            console.log('\n🎉 ALL VALIDATION PASSED! Content is ready for use.');
        } else {
            console.log('\n⚠️  Some issues found. Please review and fix before using content.');
        }

        return overallStats;
    }
}

// Run if called directly
if (require.main === module) {
    const validator = new IngestionValidator();
    validator.validate();
}

module.exports = IngestionValidator;
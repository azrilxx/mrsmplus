const { promises: fs } = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { FirebaseStudyModeStorage } = require('./firebaseStudyModeStorage');

class StudyModeFormatter {
  constructor(useFirebase = false) {
    this.SUPPORTED_FORMATS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.txt'];
    this.PARSED_CONTENT_DIR = path.join(process.cwd(), 'parsed_content');
    this.useFirebase = useFirebase;
    this.firebaseStorage = useFirebase ? new FirebaseStudyModeStorage() : null;
    this.ensureParsedContentDir();
  }

  async ensureParsedContentDir() {
    try {
      await fs.access(this.PARSED_CONTENT_DIR);
    } catch {
      await fs.mkdir(this.PARSED_CONTENT_DIR, { recursive: true });
    }
  }

  async processUpload(filePath, uploadId, metadata) {
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (!this.SUPPORTED_FORMATS.includes(fileExtension)) {
      throw new Error(`Unsupported file format: ${fileExtension}`);
    }

    let parsedContent;

    switch (fileExtension) {
      case '.pdf':
        parsedContent = await this.parsePDF(filePath);
        break;
      case '.docx':
        parsedContent = await this.parseDocx(filePath);
        break;
      case '.png':
      case '.jpg':
      case '.jpeg':
        parsedContent = await this.parseImage(filePath);
        break;
      case '.txt':
        parsedContent = await this.parseTextFile(filePath);
        break;
      default:
        throw new Error(`Unsupported file format: ${fileExtension}`);
    }

    const questions = await this.extractQuestions(parsedContent);
    
    const studyModeContent = {
      subject: metadata.subject || this.inferSubject(parsedContent.rawText),
      topic: metadata.topic || this.inferTopic(parsedContent.rawText),
      questions,
      uploadId,
      metadata: {
        uploadedBy: metadata.uploadedBy,
        uploadedAt: new Date().toISOString(),
        originalFileName: metadata.originalFileName,
        fileType: fileExtension,
        totalQuestions: questions.length,
      },
    };

    await this.saveToStorage(uploadId, studyModeContent);
    return studyModeContent;
  }

  async parsePDF(filePath) {
    try {
      const pdfBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      
      return {
        rawText: pdfData.text,
        sections: this.extractSections(pdfData.text),
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  async parseDocx(filePath) {
    throw new Error(`DOCX parsing requires additional library installation. Please install 'mammoth' package.`);
  }

  async parseImage(filePath) {
    throw new Error(`Image OCR requires additional setup. Please install 'tesseract.js' or similar OCR library.`);
  }

  async parseTextFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        rawText: content,
        sections: this.extractSections(content),
      };
    } catch (error) {
      throw new Error(`Failed to parse text file: ${error.message}`);
    }
  }

  extractSections(text) {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = { heading: 'Introduction', content: '' };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (this.isHeading(trimmedLine)) {
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        currentSection = { heading: trimmedLine, content: '' };
      } else {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }

    return sections;
  }

  isHeading(line) {
    const headingPatterns = [
      /^(Chapter|Section|Unit|Topic|Lesson)\s+\d+/i,
      /^[A-Z][A-Za-z\s]+:$/,
      /^\d+\.\s*[A-Z]/,
      /^[A-Z\s]{3,}$/,
    ];

    return headingPatterns.some(pattern => pattern.test(line));
  }

  async extractQuestions(content) {
    const questions = [];
    const text = content.rawText;

    const multipleChoiceQuestions = this.extractMultipleChoiceQuestions(text);
    const trueFalseQuestions = this.extractTrueFalseQuestions(text);
    const shortAnswerQuestions = this.extractShortAnswerQuestions(text);
    const fillBlankQuestions = this.extractFillBlankQuestions(text);

    questions.push(
      ...multipleChoiceQuestions,
      ...trueFalseQuestions,
      ...shortAnswerQuestions,
      ...fillBlankQuestions
    );

    return questions;
  }

  extractMultipleChoiceQuestions(text) {
    const questions = [];
    
    // Enhanced pattern to catch more MCQ formats
    const patterns = [
      // Standard numbered format: 1. Question? a) choice b) choice
      /(\d+\.\s*[^?\n]*\?)\s*\n?\s*([a-d]\)\s*[^\n]+(?:\s*\n\s*[a-d]\)\s*[^\n]+)*)/gi,
      // Question followed by choices without numbers
      /(What[^?\n]*\?|Which[^?\n]*\?)\s*\n?\s*([a-d]\)\s*[^\n]+(?:\s*\n\s*[a-d]\)\s*[^\n]+)*)/gi,
      // Multiple Choice prefix
      /(Multiple Choice[:\s]+[^?\n]*\?)\s*\n?\s*([a-d]\)\s*[^\n]+(?:\s*\n\s*[a-d]\)\s*[^\n]+)*)/gi
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const questionText = match[1].replace(/^\d+\.\s*/, '').replace(/^Multiple Choice[:\s]+/i, '').trim();
        const choicesText = match[2];
        
        const choices = this.parseChoices(choicesText);
        if (choices.length >= 2) {
          const answer = this.inferAnswer(text, match.index, choices);
          
          questions.push({
            type: 'multiple-choice',
            question: questionText,
            choices: choices.map(c => c.text),
            answer: answer || choices[0].text,
            explanation: this.extractExplanation(text, match.index),
            difficulty: this.inferDifficulty(questionText),
          });
        }
      }
    });

    return questions;
  }

  extractTrueFalseQuestions(text) {
    const questions = [];
    const tfPattern = /(\d+\.\s*[^?\n]*\?)\s*(?:\(True\/False\)|True or False)/gi;
    const simpleTfPattern = /(True or False[:\s]+[^?\n]*\?)/gi;
    
    let match;
    while ((match = tfPattern.exec(text)) !== null) {
      const questionText = match[1].replace(/^\d+\.\s*/, '').trim();
      const answer = this.inferTrueFalseAnswer(text, match.index);
      
      questions.push({
        type: 'true-false',
        question: questionText,
        choices: ['True', 'False'],
        answer: answer || 'True',
        explanation: this.extractExplanation(text, match.index),
        difficulty: this.inferDifficulty(questionText),
      });
    }

    while ((match = simpleTfPattern.exec(text)) !== null) {
      const questionText = match[1].replace(/^True or False[:\s]+/, '').trim();
      const answer = this.inferTrueFalseAnswer(text, match.index);
      
      questions.push({
        type: 'true-false',
        question: questionText,
        choices: ['True', 'False'],
        answer: answer || 'True',
        explanation: this.extractExplanation(text, match.index),
        difficulty: this.inferDifficulty(questionText),
      });
    }

    return questions;
  }

  extractShortAnswerQuestions(text) {
    const questions = [];
    const shortAnswerPattern = /(\d+\.\s*[^?\n]*\?)\s*(?:\([^)]*word[^)]*\)|Short answer)/gi;
    const explainPattern = /(Explain[^?\n]*\?)/gi;
    const describePattern = /(Describe[^?\n]*\?)/gi;
    
    const patterns = [shortAnswerPattern, explainPattern, describePattern];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const questionText = match[1].replace(/^\d+\.\s*/, '').trim();
        const answer = this.extractAnswerFromContext(text, match.index);
        
        questions.push({
          type: 'short-answer',
          question: questionText,
          answer: answer || 'Sample answer',
          explanation: this.extractExplanation(text, match.index),
          difficulty: this.inferDifficulty(questionText),
        });
      }
    });

    return questions;
  }

  extractFillBlankQuestions(text) {
    const questions = [];
    const fillBlankPattern = /([^.\n]*_+[^.\n]*)/g;
    
    let match;
    while ((match = fillBlankPattern.exec(text)) !== null) {
      const questionText = match[1].trim();
      if (questionText.length > 10) {
        const answer = this.inferFillBlankAnswer(text, match.index);
        
        questions.push({
          type: 'fill-blank',
          question: questionText,
          answer: answer || 'answer',
          explanation: this.extractExplanation(text, match.index),
          difficulty: this.inferDifficulty(questionText),
        });
      }
    }

    return questions;
  }

  parseChoices(choicesText) {
    const choices = [];
    const choicePattern = /([a-d])\)\s*([^\n]+)/gi;
    
    let match;
    while ((match = choicePattern.exec(choicesText)) !== null) {
      choices.push({
        label: match[1].toLowerCase(),
        text: match[2].trim(),
      });
    }

    return choices;
  }

  inferAnswer(text, questionIndex, choices) {
    const contextWindow = text.slice(questionIndex, questionIndex + 500);
    const answerPattern = /(?:Answer|Ans):\s*([a-d])/i;
    const match = answerPattern.exec(contextWindow);
    
    if (match) {
      const answerLabel = match[1].toLowerCase();
      const choice = choices.find(c => c.label === answerLabel);
      return choice ? choice.text : null;
    }

    return null;
  }

  inferTrueFalseAnswer(text, questionIndex) {
    const contextWindow = text.slice(questionIndex, questionIndex + 300);
    const answerPattern = /(?:Answer|Ans):\s*(True|False)/i;
    const match = answerPattern.exec(contextWindow);
    
    return match ? match[1] : null;
  }

  extractAnswerFromContext(text, questionIndex) {
    const contextWindow = text.slice(questionIndex, questionIndex + 400);
    const answerPattern = /(?:Answer|Ans):\s*([^\n.]+)/i;
    const match = answerPattern.exec(contextWindow);
    
    return match ? match[1].trim() : null;
  }

  inferFillBlankAnswer(text, questionIndex) {
    const contextWindow = text.slice(Math.max(0, questionIndex - 100), questionIndex + 200);
    const words = contextWindow.split(/\s+/);
    const relevantWords = words.filter(word => 
      word.length > 3 && 
      /^[A-Za-z]+$/.test(word) &&
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use'].includes(word.toLowerCase())
    );
    
    return relevantWords.length > 0 ? relevantWords[0] : null;
  }

  extractExplanation(text, questionIndex) {
    const contextWindow = text.slice(questionIndex, questionIndex + 600);
    const explanationPattern = /(?:Explanation|Reason|Because):\s*([^?\n]+)/i;
    const match = explanationPattern.exec(contextWindow);
    
    return match ? match[1].trim() : undefined;
  }

  inferDifficulty(questionText) {
    const complexWords = ['analyze', 'evaluate', 'synthesize', 'compare', 'contrast', 'justify', 'critique'];
    const mediumWords = ['explain', 'describe', 'interpret', 'calculate', 'solve'];
    
    const lowerText = questionText.toLowerCase();
    
    if (complexWords.some(word => lowerText.includes(word))) {
      return 'hard';
    } else if (mediumWords.some(word => lowerText.includes(word)) || questionText.length > 100) {
      return 'medium';
    }
    
    return 'easy';
  }

  inferSubject(text) {
    const subjectKeywords = {
      'Math': ['equation', 'calculate', 'solve', 'formula', 'number', 'algebra', 'geometry'],
      'Science': ['experiment', 'hypothesis', 'molecule', 'cell', 'energy', 'reaction', 'biology', 'chemistry', 'physics', 'respiration', 'photosynthesis'],
      'English': ['grammar', 'sentence', 'verb', 'noun', 'adjective', 'paragraph', 'essay'],
      'History': ['ancient', 'century', 'war', 'empire', 'civilization', 'historical'],
      'Geography': ['continent', 'country', 'climate', 'mountain', 'river', 'population'],
    };

    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let inferredSubject = 'General';

    for (const [subject, keywords] of Object.entries(subjectKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (lowerText.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        inferredSubject = subject;
      }
    }

    return inferredSubject;
  }

  inferTopic(text) {
    const sections = this.extractSections(text);
    if (sections.length > 0) {
      return sections[0].heading.replace(/^(Chapter|Section|Unit|Topic|Lesson)\s*\d*:?\s*/i, '').trim();
    }

    const firstParagraph = text.split('\n').find(line => line.trim().length > 20);
    if (firstParagraph) {
      const words = firstParagraph.trim().split(' ').slice(0, 4);
      return words.join(' ').replace(/[^\w\s]/g, '');
    }

    return 'General Topic';
  }

  async saveToStorage(uploadId, content) {
    // Save to local storage
    const filePath = path.join(this.PARSED_CONTENT_DIR, `${uploadId}.json`);
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');
    
    // Optionally save to Firebase
    if (this.useFirebase && this.firebaseStorage) {
      try {
        await this.firebaseStorage.saveContent(uploadId, content);
      } catch (error) {
        console.error('Firebase save failed, content saved locally only:', error.message);
      }
    }
  }

  async getStoredContent(uploadId) {
    try {
      const filePath = path.join(this.PARSED_CONTENT_DIR, `${uploadId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async listStoredContent() {
    try {
      const files = await fs.readdir(this.PARSED_CONTENT_DIR);
      return files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
    } catch {
      return [];
    }
  }
}

module.exports = { StudyModeFormatter };
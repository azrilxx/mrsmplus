# MARA+ Study Mode Formatter

## Overview

The Study Mode Formatter is a Claude-compatible ingestion pipeline that processes teacher uploads (images, PDFs, Word docs, Excel files) and converts them into structured Study Mode JSON format for the MARA+ educational platform.

## Features

- **Multi-format Support**: PDF, DOCX, PNG, JPG, TXT files
- **Smart Question Detection**: Automatically extracts multiple-choice, true/false, short-answer, and fill-in-the-blank questions
- **Subject/Topic Inference**: Uses keyword analysis to determine subject and topic
- **Answer Extraction**: Intelligent parsing of answer keys and explanations
- **Difficulty Assessment**: Automatic difficulty classification (easy/medium/hard)
- **Dual Storage**: Local filesystem + optional Firebase integration
- **RESTful API**: Complete API endpoints for upload and retrieval

## Architecture

```
Teacher Upload → File Parser → Question Extractor → JSON Formatter → Storage
     ↓              ↓              ↓                 ↓            ↓
  (PDF/DOCX)    (Text/OCR)    (AI Patterns)    (Study Mode)  (Local/Firebase)
```

## Installation

1. Install dependencies:
```bash
npm install multer uuid pdf-parse
```

2. Create required directories:
```bash
mkdir uploads parsed_content
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Upload Files
```bash
# Single file upload
POST /api/upload/single
Content-Type: multipart/form-data
Body: file, userId, subject, topic

# Bulk upload
POST /api/upload/bulk  
Content-Type: multipart/form-data
Body: files[], userId, subject, topic
```

### Retrieve Content
```bash
# Get specific content
GET /api/upload/content/:uploadId

# List all content
GET /api/upload/list

# Get by subject
GET /api/upload/subject/:subject

# Validate content
GET /api/upload/validate/:uploadId
```

## Study Mode JSON Format

```json
{
  "subject": "Science",
  "topic": "Respiration",
  "uploadId": "unique-id",
  "questions": [
    {
      "type": "multiple-choice",
      "question": "What gas is needed for respiration?",
      "choices": ["Oxygen", "Carbon Dioxide", "Nitrogen"],
      "answer": "Oxygen",
      "explanation": "Oxygen is required for cellular respiration.",
      "difficulty": "easy"
    }
  ],
  "metadata": {
    "uploadedBy": "teacher-id",
    "uploadedAt": "2025-01-08T10:30:00Z",
    "originalFileName": "chapter5.pdf",
    "fileType": ".pdf",
    "totalQuestions": 15
  }
}
```

## Question Types Supported

### 1. Multiple Choice
Detects patterns like:
- `1. What is X? a) choice b) choice`
- `Which of the following? a) choice b) choice`
- `Multiple Choice: Question? a) choice b) choice`

### 2. True/False
Detects patterns like:
- `True or False: Statement?`
- `1. Statement? (True/False)`

### 3. Short Answer
Detects patterns like:
- `Explain the process of...`
- `Describe how...`
- `What happens when...`

### 4. Fill in the Blank
Detects patterns like:
- `The process occurs in the _______ of the cell.`
- `Plants produce _______ during photosynthesis.`

## Integration with Teacher Dashboard

The formatter integrates seamlessly with `/teacher.tsx`:

```javascript
// Updated upload handler in teacher dashboard
const handleUpload = async () => {
  const formData = new FormData();
  Array.from(selectedFiles).forEach(file => {
    formData.append('files', file);
  });
  formData.append('userId', user?.uid || '');
  
  const response = await fetch('/api/upload/bulk', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  // Shows success/failure feedback
};
```

## Firebase Integration

Optional Firebase storage for scalability:

```javascript
// Enable Firebase storage
const formatter = new StudyModeFormatter(true); // useFirebase = true

// Content is saved to both local and Firestore
// Firestore collection: 'studyModeContent'
```

## Testing

Run the test pipeline:

```bash
node test-pipeline.js
```

Expected output:
```
🧪 Testing Study Mode Formatter Pipeline
✅ Processing Complete!
📊 Results Summary:
   Subject: Science
   Topic: Respiration
   Questions Found: 10
   Question Types:
     multiple-choice: 6
     fill-blank: 4
```

## File Support Status

| Format | Status | Notes |
|--------|--------|-------|
| PDF | ✅ Working | Uses pdf-parse library |
| TXT | ✅ Working | Direct text processing |
| DOCX | ⚠️ Requires setup | Needs mammoth library |
| Images | ⚠️ Requires setup | Needs tesseract.js for OCR |
| Excel | ⚠️ Future | Planned for spreadsheet questions |

## Sample Usage

```javascript
const { StudyModeFormatter } = require('./services/studyModeFormatter');

const formatter = new StudyModeFormatter();

// Process a file
const result = await formatter.processUpload(
  'sample.pdf',
  'upload-123',
  {
    uploadedBy: 'teacher-id',
    originalFileName: 'chapter5.pdf',
    subject: 'Science',
    topic: 'Respiration'
  }
);

console.log(`Extracted ${result.questions.length} questions`);
```

## Storage Locations

- **Uploads**: `/uploads/` - Original uploaded files
- **Parsed Content**: `/parsed_content/` - Processed JSON files
- **Firebase**: `studyModeContent` collection (if enabled)

## Error Handling

The system gracefully handles:
- Unsupported file formats
- Parsing failures
- Firebase connection issues (falls back to local storage)
- Invalid question formats
- Missing answer keys

## Next Steps

1. **OCR Integration**: Add tesseract.js for image text extraction
2. **DOCX Support**: Add mammoth library for Word document parsing  
3. **Excel Support**: Add xlsx library for spreadsheet questions
4. **AI Enhancement**: Integrate with Claude API for better question extraction
5. **Validation Rules**: Add custom validation for question quality

## Support

For issues or questions:
1. Check the test pipeline output
2. Review API endpoint responses
3. Verify file format compatibility
4. Check Firebase configuration (if used)

---

**Generated with MARA+ Study Mode Formatter Pipeline**
*Ready for production deployment with MARA+ educational platform*
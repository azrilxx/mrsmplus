const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { StudyModeFormatter } = require('../services/studyModeFormatter');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.txt', '.xlsx'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uploadId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uploadId}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

class UploadHandler {
  constructor() {
    this.formatter = new StudyModeFormatter();
  }

  async handleFileUpload(req, res) {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { userId, subject, topic } = req.body;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const uploadId = path.basename(req.file.filename, path.extname(req.file.filename));
      
      const studyModeContent = await this.formatter.processUpload(
        req.file.path,
        uploadId,
        {
          uploadedBy: userId,
          originalFileName: req.file.originalname,
          subject,
          topic,
        }
      );

      res.status(200).json({
        success: true,
        uploadId,
        content: studyModeContent,
        message: `Successfully processed ${studyModeContent.questions.length} questions`,
      });

    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        error: 'Failed to process upload',
        details: error.message,
      });
    }
  }

  async handleBulkUpload(req, res) {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const { userId, subject, topic } = req.body;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const results = [];
      const errors = [];

      for (const file of files) {
        try {
          const uploadId = path.basename(file.filename, path.extname(file.filename));
          
          const studyModeContent = await this.formatter.processUpload(
            file.path,
            uploadId,
            {
              uploadedBy: userId,
              originalFileName: file.originalname,
              subject,
              topic,
            }
          );

          results.push({
            uploadId,
            fileName: file.originalname,
            questionsFound: studyModeContent.questions.length,
            subject: studyModeContent.subject,
            topic: studyModeContent.topic,
          });

        } catch (error) {
          errors.push({
            fileName: file.originalname,
            error: error.message,
          });
        }
      }

      res.status(200).json({
        success: true,
        processed: results.length,
        failed: errors.length,
        results,
        errors,
      });

    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({
        error: 'Failed to process bulk upload',
        details: error.message,
      });
    }
  }

  async getUploadedContent(req, res) {
    try {
      const { uploadId } = req.params;
      
      const content = await this.formatter.getStoredContent(uploadId);
      if (!content) {
        res.status(404).json({ error: 'Content not found' });
        return;
      }

      res.status(200).json({
        success: true,
        content,
      });

    } catch (error) {
      console.error('Get content error:', error);
      res.status(500).json({
        error: 'Failed to retrieve content',
        details: error.message,
      });
    }
  }

  async listUploadedContent(req, res) {
    try {
      const uploadIds = await this.formatter.listStoredContent();
      
      const contentList = [];
      for (const uploadId of uploadIds) {
        const content = await this.formatter.getStoredContent(uploadId);
        if (content) {
          contentList.push({
            uploadId,
            subject: content.subject,
            topic: content.topic,
            questionsCount: content.questions.length,
            uploadedBy: content.metadata.uploadedBy,
            uploadedAt: content.metadata.uploadedAt,
            originalFileName: content.metadata.originalFileName,
          });
        }
      }

      res.status(200).json({
        success: true,
        total: contentList.length,
        content: contentList,
      });

    } catch (error) {
      console.error('List content error:', error);
      res.status(500).json({
        error: 'Failed to list content',
        details: error.message,
      });
    }
  }

  async getContentBySubject(req, res) {
    try {
      const { subject } = req.params;
      const uploadIds = await this.formatter.listStoredContent();
      
      const filteredContent = [];
      for (const uploadId of uploadIds) {
        const content = await this.formatter.getStoredContent(uploadId);
        if (content && content.subject.toLowerCase() === subject.toLowerCase()) {
          filteredContent.push(content);
        }
      }

      res.status(200).json({
        success: true,
        subject,
        total: filteredContent.length,
        content: filteredContent,
      });

    } catch (error) {
      console.error('Get content by subject error:', error);
      res.status(500).json({
        error: 'Failed to retrieve content by subject',
        details: error.message,
      });
    }
  }

  async validateUpload(req, res) {
    try {
      const { uploadId } = req.params;
      
      const content = await this.formatter.getStoredContent(uploadId);
      if (!content) {
        res.status(404).json({ error: 'Content not found' });
        return;
      }

      const validation = {
        isValid: true,
        issues: [],
        summary: {
          totalQuestions: content.questions.length,
          questionTypes: {},
          hasExplanations: 0,
          hasDifficulty: 0,
        },
      };

      content.questions.forEach((question, index) => {
        validation.summary.questionTypes[question.type] = 
          (validation.summary.questionTypes[question.type] || 0) + 1;

        if (question.explanation) validation.summary.hasExplanations++;
        if (question.difficulty) validation.summary.hasDifficulty++;

        if (!question.question || question.question.trim().length === 0) {
          validation.isValid = false;
          validation.issues.push(`Question ${index + 1}: Empty question text`);
        }

        if (!question.answer || question.answer.trim().length === 0) {
          validation.isValid = false;
          validation.issues.push(`Question ${index + 1}: Missing answer`);
        }

        if (question.type === 'multiple-choice' && (!question.choices || question.choices.length < 2)) {
          validation.isValid = false;
          validation.issues.push(`Question ${index + 1}: Multiple choice needs at least 2 choices`);
        }
      });

      res.status(200).json({
        success: true,
        uploadId,
        validation,
      });

    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({
        error: 'Failed to validate content',
        details: error.message,
      });
    }
  }
}

module.exports = { UploadHandler, upload };
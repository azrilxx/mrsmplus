const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
// const { uploadToCollection } = require("../firebase/firestoreUploader");

const UPLOAD_TEMP_DIR = path.join(process.cwd(), "temp");

async function handleFileUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { userId, subject, topic } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const uploadId = path.basename(req.file.filename, path.extname(req.file.filename));
    const inputFilePath = req.file.path;
    const outputFilePath = path.join(UPLOAD_TEMP_DIR, `${uploadId}_claude_output.json`);

    // Ensure temp dir exists
    if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
      fs.mkdirSync(UPLOAD_TEMP_DIR);
    }

    const runClaudePipeline = () => {
      return new Promise((resolve, reject) => {
        const claude = spawn("claude", [
          "--run",
          "agents/content_ingestion_orchestrator.md",
          "--input",
          inputFilePath,
          "--output",
          outputFilePath
        ]);

        claude.stdout.on("data", (data) => console.log(`Claude: ${data}`));
        claude.stderr.on("data", (data) => console.error(`Error: ${data}`));

        claude.on("close", (code) => {
          if (code === 0 && fs.existsSync(outputFilePath)) {
            try {
              const parsed = JSON.parse(fs.readFileSync(outputFilePath, "utf-8"));

              // Inject metadata before upload
              parsed.metadata = {
                uploadedBy: userId,
                uploadedAt: new Date().toISOString(),
                originalFileName: req.file.originalname,
                subject,
                topic
              };

              fs.writeFileSync(outputFilePath, JSON.stringify(parsed, null, 2));
              resolve(parsed);
            } catch (parseError) {
              reject(new Error("Failed to parse Claude output JSON"));
            }
          } else {
            reject(new Error("Claude ingestion failed"));
          }
        });
      });
    };

    const studyModeContent = await runClaudePipeline();

    const uploadSuccess = await uploadToCollection("study-materials", outputFilePath, {
      useCustomId: true
    });

    if (!uploadSuccess) {
      return res.status(500).json({ error: "Failed to upload content to Firestore" });
    }

    res.status(200).json({
      success: true,
      uploadId,
      subject: studyModeContent.subject || subject,
      topic: studyModeContent.topic || topic,
      questions: studyModeContent.questions,
      total: studyModeContent.questions?.length || 0,
      message: `Successfully processed and stored ${studyModeContent.questions?.length || 0} questions.`
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({
      error: "Failed to process upload",
      details: error.message
    });
  }
}

module.exports = { handleFileUpload };

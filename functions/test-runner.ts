import ingestUploadedMaterial from "./ingestUploadedMaterial";
import formattedQuestions from "./formattedStudyModeQuestions.json";

async function runTest() {
  console.log("=== Starting Altman Upload MVP Test ===");

  try {
    await ingestUploadedMaterial(formattedQuestions);
    console.log("✅ Test completed without timeout or error.");
  } catch (err) {
    console.error("❌ Test failed:", err);
  }

  console.log("=== Test Finished ===");
}

runTest();

import firebaseConnector from "./firebase-connector";

async function ingestUploadedMaterial(formattedStudyModeQuestions) {
  const fallback = [
    {
      type: "multiple_choice",
      question: "What is the capital of Malaysia?",
      options: ["Kuala Lumpur", "Johor Bahru", "Penang", "Putrajaya"],
      answer: "Kuala Lumpur",
      hint: "Think economic center"
    }
  ];

  const dataToSend = formattedStudyModeQuestions?.length ? formattedStudyModeQuestions : fallback;

  if (!dataToSend || dataToSend.length === 0) {
    console.warn("No data to send to firebase-connector");
    return;
  }

  const result = await firebaseConnector(dataToSend);
  console.log("Firestore (simulated) result:", result);
}

export default ingestUploadedMaterial;

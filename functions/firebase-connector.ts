export default async function firebaseConnector(questionData) {
  console.log("Simulating Firestore upload...");

  return {
    status: "success",
    uploadedCount: questionData?.length || 0,
    fakePath: "/subjects/DummySubject/topics/Test/questions/"
  };
}

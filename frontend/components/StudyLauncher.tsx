// PATCH: Minimal Firestore integration to display uploaded questions
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const StudyLauncher = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(
        collection(db, "subjects", "DummySubject", "topics", "Test", "questions")
      );
      const data = querySnapshot.docs.map((doc) => doc.data());
      setQuestions(data);
    };

    fetchQuestions();
  }, []);

  return (
    <div>
      <h2>Study Mode Questions</h2>
      {questions.length === 0 ? (
        <p>Loading or no questions found.</p>
      ) : (
        questions.map((q, index) => (
          <div key={index}>
            <strong>[TEST]</strong> {q.question}
            <ul>
              {q.options?.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default StudyLauncher;

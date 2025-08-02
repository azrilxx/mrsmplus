// MARA+ Study Mode AI Explanation API
// Fallback endpoint for generating explanations when Claude is not available

import { Request, Response } from 'express';

interface ExplanationRequest {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  subject: string;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const generateStudyExplanation = async (req: Request, res: Response) => {
  try {
    const {
      question,
      correctAnswer,
      userAnswer,
      subject,
      topic,
      difficulty = 'medium'
    }: ExplanationRequest = req.body;

    // Validate required fields
    if (!question || !correctAnswer || !subject || !topic) {
      return res.status(400).json({
        error: 'Missing required fields: question, correctAnswer, subject, topic'
      });
    }

    // Generate contextual explanation based on subject and MRSM curriculum
    const explanation = await generateExplanation({
      question,
      correctAnswer,
      userAnswer,
      subject,
      topic,
      difficulty
    });

    res.json({
      success: true,
      explanation,
      metadata: {
        subject,
        topic,
        difficulty,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Study explanation generation error:', error);
    res.status(500).json({
      error: 'Failed to generate explanation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

async function generateExplanation(params: ExplanationRequest): Promise<string> {
  const { question, correctAnswer, userAnswer, subject, topic, difficulty } = params;

  // Mock AI explanation generation - replace with actual AI service
  // In production, this would call OpenAI GPT, Claude, or other AI service
  
  const templates = {
    mathematics: {
      intro: `Let's break down this ${topic} problem step by step:`,
      methodology: [
        "Identify what the question is asking",
        "Determine which mathematical concepts apply",
        "Apply the appropriate formula or method",
        "Check our answer for reasonableness"
      ]
    },
    science: {
      intro: `Here's how to approach this ${topic} question:`,
      methodology: [
        "Identify the scientific concept being tested",
        "Recall the relevant principles or laws",
        "Apply the concept to the specific scenario",
        "Consider real-world applications"
      ]
    },
    english: {
      intro: `Let's analyze this ${topic} question:`,
      methodology: [
        "Identify the grammar rule or concept",
        "Understand why the correct answer follows the rule",
        "See how it applies in context",
        "Practice with similar examples"
      ]
    },
    computer_science: {
      intro: `Let's work through this ${topic} problem:`,
      methodology: [
        "Understand the problem requirements",
        "Choose the appropriate algorithm or data structure",
        "Trace through the solution step-by-step",
        "Analyze time and space complexity"
      ]
    },
    bahasa_malaysia: {
      intro: `Mari kita fahami soalan ${topic} ini:`,
      methodology: [
        "Kenal pasti konsep tatabahasa yang diuji",
        "Fahami mengapa jawapan yang betul mengikut peraturan",
        "Lihat bagaimana ia digunakan dalam konteks",
        "Berlatih dengan contoh yang serupa"
      ]
    }
  };

  const template = templates[subject as keyof typeof templates] || templates.english;

  let explanation = `${template.intro}\n\n`;
  explanation += `**Question:** ${question}\n\n`;
  explanation += `**Your Answer:** ${userAnswer || 'No answer provided'}\n`;
  explanation += `**Correct Answer:** ${correctAnswer}\n\n`;

  // Add difficulty-appropriate explanation depth
  if (difficulty === 'easy') {
    explanation += `**Simple Explanation:**\n`;
    explanation += `The correct answer is "${correctAnswer}" because it directly addresses what the question is asking. `;
    explanation += getSimpleReasoning(subject, topic, question, correctAnswer);
  } else if (difficulty === 'medium') {
    explanation += `**Detailed Explanation:**\n`;
    explanation += `To understand why "${correctAnswer}" is correct, let's examine the underlying concepts:\n\n`;
    explanation += getDetailedReasoning(subject, topic, question, correctAnswer, userAnswer);
  } else {
    explanation += `**Advanced Analysis:**\n`;
    explanation += `This question tests your deeper understanding of ${topic}. Here's a comprehensive breakdown:\n\n`;
    explanation += getAdvancedReasoning(subject, topic, question, correctAnswer, userAnswer);
  }

  explanation += `\n\n**Study Tips:**\n`;
  template.methodology.forEach((tip, index) => {
    explanation += `${index + 1}. ${tip}\n`;
  });

  explanation += `\n**Practice Suggestion:**\n`;
  explanation += getPracticeAdvice(subject, topic, difficulty);

  return explanation;
}

function getSimpleReasoning(subject: string, topic: string, question: string, correctAnswer: string): string {
  if (subject === 'mathematics') {
    return `Mathematical problems like this follow specific rules and formulas. By applying the correct method, we arrive at ${correctAnswer}.`;
  } else if (subject === 'science') {
    return `In ${topic}, scientific principles help us understand natural phenomena. The answer ${correctAnswer} follows these established principles.`;
  } else if (subject === 'english') {
    return `Grammar rules in English help us communicate clearly. The answer ${correctAnswer} follows the standard grammar conventions.`;
  }
  return `The concept being tested here has specific rules that lead to the answer ${correctAnswer}.`;
}

function getDetailedReasoning(subject: string, topic: string, question: string, correctAnswer: string, userAnswer: string): string {
  let reasoning = '';
  
  if (subject === 'mathematics') {
    reasoning += `Mathematical reasoning involves:\n`;
    reasoning += `• Understanding the problem structure\n`;
    reasoning += `• Applying the correct formula or theorem\n`;
    reasoning += `• Following logical steps to reach the solution\n`;
    reasoning += `• Verifying the result makes sense in context\n\n`;
    
    if (userAnswer && userAnswer !== correctAnswer) {
      reasoning += `Your answer "${userAnswer}" might have resulted from a common mistake in ${topic}. `;
      reasoning += `The key difference is in how we apply the fundamental principles.\n`;
    }
  } else if (subject === 'science') {
    reasoning += `Scientific understanding requires:\n`;
    reasoning += `• Connecting theoretical knowledge to practical situations\n`;
    reasoning += `• Understanding cause-and-effect relationships\n`;
    reasoning += `• Applying scientific laws and principles\n`;
    reasoning += `• Considering experimental evidence\n\n`;
    
    if (userAnswer && userAnswer !== correctAnswer) {
      reasoning += `Your answer "${userAnswer}" shows partial understanding, but the complete scientific explanation leads to "${correctAnswer}".\n`;
    }
  } else if (subject === 'english') {
    reasoning += `Language mastery involves:\n`;
    reasoning += `• Understanding grammatical structures\n`;
    reasoning += `• Recognizing patterns in language use\n`;
    reasoning += `• Applying rules consistently\n`;
    reasoning += `• Considering context and meaning\n\n`;
    
    if (userAnswer && userAnswer !== correctAnswer) {
      reasoning += `Your answer "${userAnswer}" follows a common pattern, but the grammar rule specifically requires "${correctAnswer}" in this context.\n`;
    }
  }
  
  return reasoning;
}

function getAdvancedReasoning(subject: string, topic: string, question: string, correctAnswer: string, userAnswer: string): string {
  let reasoning = `This ${topic} question requires deep conceptual understanding. `;
  
  if (subject === 'mathematics') {
    reasoning += `Advanced mathematical thinking involves recognizing patterns, making connections between different mathematical concepts, and understanding the underlying theoretical framework. `;
    reasoning += `The solution "${correctAnswer}" emerges from a sophisticated application of mathematical principles that goes beyond mechanical computation.`;
  } else if (subject === 'science') {
    reasoning += `Scientific expertise requires integrating knowledge across multiple domains, understanding the limitations of models, and appreciating the complexity of natural systems. `;
    reasoning += `The answer "${correctAnswer}" reflects a nuanced understanding of how different scientific principles interact.`;
  } else if (subject === 'english') {
    reasoning += `Advanced language proficiency involves understanding subtle distinctions in meaning, recognizing stylistic choices, and appreciating the evolution of language rules. `;
    reasoning += `The choice of "${correctAnswer}" demonstrates sophisticated linguistic awareness.`;
  }
  
  if (userAnswer && userAnswer !== correctAnswer) {
    reasoning += `\n\nYour response "${userAnswer}" suggests you're thinking at an advanced level, but there's a subtle distinction that leads to the correct answer. This type of nuanced understanding comes with extensive practice and exposure to complex problems.`;
  }
  
  return reasoning;
}

function getPracticeAdvice(subject: string, topic: string, difficulty: string): string {
  const adviceMap = {
    mathematics: {
      easy: `Practice similar problems daily, focusing on understanding the basic concepts before moving to complex applications.`,
      medium: `Work through varied problem sets, paying attention to different problem-solving strategies and when to apply them.`,
      hard: `Challenge yourself with competition-level problems and explore connections between different mathematical areas.`
    },
    science: {
      easy: `Read science articles and relate them to classroom concepts. Conduct simple experiments to see principles in action.`,
      medium: `Analyze case studies and real-world applications. Practice explaining scientific concepts in your own words.`,
      hard: `Engage with current research papers and advanced textbooks. Consider how different scientific disciplines interconnect.`
    },
    english: {
      easy: `Read regularly and pay attention to sentence structure. Practice identifying parts of speech and basic grammar rules.`,
      medium: `Analyze writing styles of different authors. Practice writing with focus on clarity and grammatical accuracy.`,
      hard: `Study advanced rhetorical techniques and literary analysis. Experiment with different writing styles and voices.`
    }
  };

  const subjectAdvice = adviceMap[subject as keyof typeof adviceMap] || adviceMap.english;
  return subjectAdvice[difficulty as keyof typeof subjectAdvice] || subjectAdvice.medium;
}

export default generateStudyExplanation;
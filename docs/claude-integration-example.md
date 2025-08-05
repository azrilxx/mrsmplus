# Claude Integration for Study Mode Q&A Engine

This document outlines how to integrate Claude AI for dynamic question generation in the MARA+ Study Mode.

## Claude Ingestion Agent Format

### Input Format
When calling the Claude ingestion agent, send a request with the following structure:

```json
{
  "subject": "math",
  "form_level": "Form 4",
  "topic": "algebra",
  "difficulty": "medium",
  "question_count": 5,
  "question_types": ["multiple_choice", "short_answer"],
  "student_context": {
    "previous_performance": "75%",
    "weak_areas": ["quadratic equations"],
    "strong_areas": ["linear equations"]
  }
}
```

### Expected Output Format
Claude should return questions in this exact format:

```json
{
  "success": true,
  "questions": [
    {
      "id": "claude_math_algebra_001",
      "question": "Solve for x: 2x + 5 = 13",
      "type": "multiple_choice",
      "options": ["x = 3", "x = 4", "x = 5", "x = 6"],
      "correctAnswer": "x = 4",
      "explanation": "Subtract 5 from both sides: 2x = 8. Then divide by 2: x = 4",
      "xpValue": 15,
      "topic": "algebra",
      "difficulty": "medium",
      "bloom_taxonomy": "apply"
    },
    {
      "id": "claude_math_algebra_002", 
      "question": "What is the standard form of a quadratic equation?",
      "type": "short_answer",
      "correctAnswer": "ax² + bx + c = 0",
      "explanation": "The standard form has the highest degree term first, followed by decreasing powers, set equal to zero",
      "xpValue": 12,
      "topic": "algebra",
      "difficulty": "easy",
      "bloom_taxonomy": "remember"
    }
  ],
  "metadata": {
    "generation_time": "2024-01-15T10:30:00Z",
    "claude_model": "claude-3-sonnet",
    "curriculum_alignment": "Malaysian KSSM Form 4 Mathematics",
    "quality_score": 0.92
  }
}
```

## Implementation in Study Session

The study session attempts Claude integration in this order:

1. **Claude API Call** - Try to generate dynamic questions
2. **JSON Fallback** - Use static content from `/public/content/{subject}.json`
3. **Hardcoded Fallback** - Use embedded question bank

### Claude API Integration Point

```typescript
const generateClaudeQuestions = async (subjectId: string): Promise<Question[]> => {
  try {
    const response = await fetch('/api/claude/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: subjectId,
        form_level: 'Form 4',
        question_count: 10,
        difficulty: 'mixed'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.questions || [];
    }
  } catch (error) {
    console.error('Claude API error:', error);
  }
  
  return []; // Fallback to next method
};
```

## API Endpoint Implementation

Create `/pages/api/claude/generate-questions.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Call Claude API here
    const claudeResponse = await callClaudeAPI(req.body);
    
    if (claudeResponse.success) {
      res.status(200).json(claudeResponse);
    } else {
      res.status(500).json({ error: 'Failed to generate questions' });
    }
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function callClaudeAPI(params: any) {
  // Implementation depends on your Claude API setup
  // This could be a direct API call or integration with your agent runner
  return {
    success: true,
    questions: []
  };
}
```

## Quality Assurance

All Claude-generated questions should be validated for:

- **Curriculum Alignment**: Match Malaysian KSSM standards
- **Age Appropriateness**: Suitable for Form 4 students
- **Language Clarity**: Clear, unambiguous wording
- **Answer Accuracy**: Correct answers and explanations
- **Difficulty Progression**: Appropriate challenge level

## Fallback Strategy

The system gracefully handles Claude unavailability:

1. **Network Issues**: Automatic timeout and fallback
2. **API Limits**: Rate limiting with fallback
3. **Quality Issues**: Validation with fallback
4. **Empty Response**: Immediate fallback

This ensures students always have access to quality questions, regardless of Claude availability.
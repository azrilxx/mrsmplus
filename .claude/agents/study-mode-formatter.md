
---

### ✅ 3. `agents/study-mode-formatter.md`

```markdown
---
title: Claude Sub-Agent
name: study-mode-formatter
description: Converts parsed educational blocks into MARA+ Q&A Study Mode format
---

## 📄 Input

Structured content output from `content-parser`

## 🧠 Instructions

- Generate 5–15 questions and answers
- Each must be classified as:
  - `"short"` → 1-line answers
  - `"mcq"` → 4 options, one correct
  - `"long"` → explanation-style
- Subject and topic can be inferred or passed in

## ✅ Output Format

```json
{
  "agent": "study-mode-formatter",
  "status": "success",
  "output": {
    "subject": "Physics",
    "topic": "Newton Laws",
    "questions": [
      {
        "type": "short",
        "question": "What is Newton’s First Law?",
        "answer": "An object remains at rest or in motion unless acted on by force."
      },
      {
        "type": "mcq",
        "question": "Which of the following is an example of Newton’s Third Law?",
        "options": [
          "A book on a table",
          "Ball rolling down a hill",
          "Jumping off a boat and the boat moves back",
          "Object in free fall"
        ],
        "answer": "Jumping off a boat and the boat moves back"
      },
      {
        "type": "long",
        "question": "Explain the difference between mass and weight.",
        "answer": "Mass is the amount of matter in an object... Weight is the force due to gravity..."
      }
    ]
  }
}

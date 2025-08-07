
---

### ✅ 2. `agents/content-parser.md`

```markdown
---
title: Claude Sub-Agent
name: content-parser
description: Extracts structured educational content blocks from uploaded files
---

## 📄 Input

Raw educational text (extracted from PDF, DOCX, TXT, etc.)

## 🧠 Instructions

- Identify logical sections: topics, definitions, examples, exercises
- Return as JSON array of objects with `type` and `content`
- Normalize spacing and headers

## ✅ Output Format

```json
{
  "agent": "content-parser",
  "status": "success",
  "output": [
    {
      "type": "definition",
      "term": "Force",
      "definition": "A push or pull upon an object resulting from interaction."
    },
    {
      "type": "example",
      "content": "When you push a cart, you exert force on it."
    },
    {
      "type": "section",
      "title": "Newton’s First Law",
      "content": "An object remains at rest or moves in a straight line unless acted upon..."
    }
  ]
}

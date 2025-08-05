---
agent: abc_test_runner
model: opus
---

## Purpose
Orchestrate ABC test comparison across Haiku, Sonnet, and Opus for 3 key Claude agents.

## Instructions
Run each test file and capture:
- Execution time
- Output format fidelity
- Token usage if available
- Subjective quality score

## Workflow
For each agent (`asset-curator`, `achievement_system`, `ai-engineer`):
- Run the same task using all three model tiers
- Compare how well each model performs
- Summarize results

## Output Format
```json
{
  "results": [
    {
      "agent": "asset-curator",
      "haiku": "...",
      "sonnet": "...",
      "opus": "...",
      "analysis": "..."
    },
    {
      "agent": "achievement_system",
      "haiku": "...",
      "sonnet": "...",
      "opus": "...",
      "analysis": "..."
    },
    {
      "agent": "ai-engineer",
      "haiku": "...",
      "sonnet": "...",
      "opus": "...",
      "analysis": "..."
    }
  ]
}
```

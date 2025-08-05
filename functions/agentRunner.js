const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const onStart = require('./hooks/onStart');
const onComplete = require('./hooks/onComplete');
const onFail = require('./hooks/onFail');
const onRetry = require('./hooks/onRetry');

async function runAgent(agentName, preferredModel) {
  const agentPath = path.join(__dirname, '..', '.claude', `${agentName}.md`);
  if (!fs.existsSync(agentPath)) {
    console.error(`❌ Agent file not found: ${agentPath}`);
    return;
  }

  const input = fs.readFileSync(agentPath, 'utf-8');
  const modelFallbackOrder = {
    opus: ['opus', 'sonnet', 'haiku'],
    sonnet: ['sonnet', 'haiku'],
    haiku: ['haiku']
  };

  const fallbackModels = modelFallbackOrder[preferredModel] || [preferredModel];

  for (const model of fallbackModels) {
    onStart(agentName, model);
    try {
      const result = execSync(`claude ${agentPath} --model ${model}`, { encoding: 'utf-8' });
      const output = result.trim();
      onComplete(agentName, model, output);
      return;
    } catch (error) {
      onFail(agentName, model, error);
      onRetry(agentName, model, 1); // No retry loop, just fallback sequence
    }
  }

  console.error(`💥 All model fallbacks failed for agent: ${agentName}`);
}

// CLI usage
const [,, agentName, model] = process.argv;
if (!agentName || !model) {
  console.error('Usage: node agentRunner.js <agent-name> <preferred-model>');
  process.exit(1);
}

runAgent(agentName, model);

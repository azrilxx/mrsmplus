const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const onStart = require('./hooks/onStart');
const onComplete = require('./hooks/onComplete');
const onFail = require('./hooks/onFail');
const onRetry = require('./hooks/onRetry');

async function runAgent(agentName, model) {
  const agentPath = path.join(__dirname, '..', '.claude', `${agentName}.md`);
  if (!fs.existsSync(agentPath)) {
    console.error(`❌ Agent file not found: ${agentPath}`);
    return;
  }

  const input = fs.readFileSync(agentPath, 'utf-8');
  onStart(agentName, model);

  let output = '';
  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Execute the Claude CLI with model and file
      const result = execSync(`claude ${agentPath} --model ${model}`, { encoding: 'utf-8' });
      output = result.trim();
      onComplete(agentName, model, output);
      return;
    } catch (error) {
      onFail(agentName, model, error);
      if (attempt < maxRetries) {
        onRetry(agentName, model, attempt);
      }
    }
  }
  console.error(`💥 All attempts failed for ${agentName}`);
}

// CLI usage
const [,, agentName, model] = process.argv;
if (!agentName || !model) {
  console.error('Usage: node agentRunner.js <agent-name> <model>');
  process.exit(1);
}

runAgent(agentName, model);

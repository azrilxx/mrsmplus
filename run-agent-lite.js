const { exec } = require('child_process');
const fs = require('fs');

const agentName = process.argv[2];
const model = process.argv[3] || 'sonnet';
const inputFile = process.argv[4];

if (!agentName || !inputFile) {
  console.error('Usage: node run-agent-lite.js <agent-name> [model] <input-file>');
  process.exit(1);
}

const inputData = fs.readFileSync(inputFile, 'utf-8')
  .replace(/"/g, '\"')
  .replace(/\n/g, ' ');

const prompt = `Analyze the following input and return a valid JSON output:\n${inputData}`;

const command = `echo "${prompt}" | claude .claude/agents/${agentName}.md --model ${model}`;

console.log(`🧠 Running agent '${agentName}' with model '${model}'`);
console.log(`📄 Using input: ${inputFile}\n`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Execution error: ${error.message}`);
    return;
  }
  console.log(stdout);
  if (stderr) {
    console.error(`⚠️ STDERR: ${stderr}`);
  }
});
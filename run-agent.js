const { exec } = require('child_process');

const agentName = process.argv[2];
const model = process.argv[3] || 'sonnet';

if (!agentName) {
  console.error('Usage: node run-agent.js <agent-name> [model]');
  process.exit(1);
}

exec(`node functions/agentRunner.js ${agentName} ${model}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
});

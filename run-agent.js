const { exec } = require('child_process');
const { argv, env, exit } = require('process');

const agentName = argv[2];
const model = argv[3] || 'sonnet';
const inputPath = argv[4] || null;

if (!agentName) {
  console.error('Usage: node run-agent.js <agent-name> [model] [input-file]');
  process.exit(1);
}

// Auto-bump memory if not already set
if (!env.NODE_OPTIONS || !env.NODE_OPTIONS.includes('--max-old-space-size')) {
  const args = ['--max-old-space-size=8192', 'run-agent.js', ...argv.slice(2)];
  const cmd = `node ${args.join(' ')}`;
  console.log(`🔁 Restarting with more memory: ${cmd}`);
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error after memory bump: ${error.message}`);
      return;
    }
    console.log(stdout);
    if (stderr) console.error(stderr);
  });
  return;
}

const fullCmd = inputPath
  ? `claude .claude/agents/${agentName}.md --model ${model} --input ${inputPath}`
  : `claude .claude/agents/${agentName}.md --model ${model}`;

console.log(`🧠 Running agent: ${agentName} on model: ${model}`);
if (inputPath) {
  console.log(`📄 Using input file: ${inputPath}`);
}

exec(fullCmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Agent Error: ${error.message}`);
    return;
  }
  console.log(`✅ Agent ${agentName} completed:\n`);
  console.log(stdout);
  if (stderr) console.error(`⚠️ STDERR:\n${stderr}`);
});
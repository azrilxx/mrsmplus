const fs = require('fs');
const path = require('path');

module.exports = function onComplete(agentName, model, output) {
  const filename = `${agentName}__${model}.md`;
  const savePath = path.join(__dirname, '../../docs/results', filename);
  fs.writeFileSync(savePath, output, 'utf-8');
  console.log(`✅ Output saved to ${filename}`);
};

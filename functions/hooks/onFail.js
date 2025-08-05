module.exports = function onFail(agentName, model, error) {
  console.error(`❌ Agent ${agentName} failed on model ${model}`);
  console.error(error.message || error);
};

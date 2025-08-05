module.exports = function onRetry(agentName, model, attempt) {
  console.log(`🔁 Retrying ${agentName} on model ${model}, attempt ${attempt}`);
};

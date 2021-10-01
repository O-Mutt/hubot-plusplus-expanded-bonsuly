function createProcVars(env) {
  const procVars = {};
  procVars.mongoUri = env.MONGO_URI || 'mongodb://localhost/plusPlus';
  procVars.bonuslyApiKey = env.BONUSLY_API_KEY;
  procVars.bonuslyUri = env.BONUSLY_URI;
  procVars.bonuslyDefaultReason = env.BONUSLY_DEFAULT_REASON;
  return procVars;
}

module.exports = {
  createProcVars,
};

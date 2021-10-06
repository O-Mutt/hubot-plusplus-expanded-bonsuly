function createProcVars(env) {
  const procVars = {};
  procVars.mongoUri = env.MONGO_URI || 'mongodb://localhost/plusPlus';
  procVars.bonuslyApiKey = env.BONUSLY_API_KEY;
  procVars.bonuslyUri = env.BONUSLY_URI;
  procVars.bonuslyDefaultReason = env.BONUSLY_DEFAULT_REASON;
  return procVars;
}

function capitalizeFirstLetter(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  createProcVars,
  capitalizeFirstLetter,
};

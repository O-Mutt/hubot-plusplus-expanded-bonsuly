var fs = require('fs');

var path = require('path');

module.exports = function(robot, scripts) {
  'use strict';
  const scriptsPath = path.resolve(__dirname, 'src');
  return fs.exists(scriptsPath, function(exists) {
    if (exists) {
      const ref = fs.readdirSync(scriptsPath);
      const results = [];
      for (const i = 0, len = ref.length; i < len; i++) {
        const script = ref[i];
        if (scripts && scripts.indexOf('*') < 0) {
          if (scripts.indexOf(script) > -1) {
            results.push(robot.loadFile(scriptsPath, script));
          }
        } else {
          results.push(robot.loadFile(scriptsPath, script));
        }
      }
      return results;
    }
  });
};

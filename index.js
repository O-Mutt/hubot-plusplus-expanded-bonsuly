var fs = require('fs');

var path = require('path');

module.exports = function(robot, scripts) {
	'use strict';
	const scriptsPath = path.resolve(__dirname, 'src');
	try {
		const scripts = fs.readdirSync(scriptsPath);
		let results = [];
		for (const script in scripts) {
			if (script && script.indexOf('*') < 0) {
				if (scripts.indexOf(script) > -1) {
					results.push(robot.loadFile(scriptsPath, script));
				}
			} else {
				results.push(robot.loadFile(scriptsPath, script));
			}
		}
		return results;
	} catch (e) {
		console.log('An error occurred');
	}
};

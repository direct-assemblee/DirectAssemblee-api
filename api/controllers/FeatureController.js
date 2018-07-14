let Promise = require('bluebird');
let ResponseBuilder = require('./ResponseBuilder.js');

module.exports = {
	getFeatures: function(req, res) {
		return ResponseBuilder.build(res, 200, sails.config.features)
	}
};

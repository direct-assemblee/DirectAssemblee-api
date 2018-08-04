let Promise = require('bluebird');
let ResponseBuilder = require('./helpers/ResponseBuilder.js');

module.exports = {
	getFeatures: function(req, res) {
		return ResponseBuilder.build(res, 200, sails.config.features)
	}
};

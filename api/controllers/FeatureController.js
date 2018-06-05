let Promise = require('bluebird');

module.exports = {
	getFeatures: function(req, res) {
		return res.status(200).json(sails.config.features);
	}
};

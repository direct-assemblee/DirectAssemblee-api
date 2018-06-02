let CacheService = require('../services/CacheService');

module.exports = {
	resetCache: function(req, res) {
		return CacheService.resetAll()
		.then(function() {
			return res.status(200).json('OK');
		})
	}
};

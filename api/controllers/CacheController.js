let CacheService = require('../services/CacheService');

module.exports = {
	resetCache: function(req, res) {
		CacheService.reset();
		return res.status(200).json('OK');
	}
};

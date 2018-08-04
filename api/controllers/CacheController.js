let CacheService = require('../services/CacheService');

module.exports = {
	resetCache: function(req, res) {
		CacheService.resetAll()
		return res.status(200).json('OK');
	}
};

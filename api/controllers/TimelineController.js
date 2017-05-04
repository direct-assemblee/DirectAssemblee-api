const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

var self = module.exports = {
	getTimeline: function(req, res) {
		var deputyId = req.param('deputyId');
		if (!deputyId) {
			return res.badRequest('Must provide deputyId as a parameter.');
		} else {
			var offset = req.param('page');
			if (!offset) {
				offset = 0;
			}

			TimelineService.getTimeline(deputyId, parseInt(offset))
			.then(function(timelineItems) {
				if (!timelineItems) {
					return res.notFound('Could not find timeline items, sorry.');
				}
				return res.json(timelineItems);
			})
			.catch(function(err) {
				sails.log.error(err);
				return res.negotiate(err);
			});
		}
	}
};

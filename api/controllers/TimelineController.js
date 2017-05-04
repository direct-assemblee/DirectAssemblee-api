const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

var self = module.exports = {
	getTimeline: function(req, res) {
		var deputyId = req.param('deputyId');
		if (!deputyId) {
			return res.json(400, 'Must provide deputyId as a parameter.');
		} else {
			var offset = req.param('page');
			if (!offset) {
				offset = 0;
			}
			return TimelineService.getTimeline(deputyId, parseInt(offset))
			.then(function(timelineItems) {
				if (!timelineItems) {
					return res.json(404, 'No items found for deputy with id : ' + deputyId);
				}
				return res.json(timelineItems);
			})
		}
	}
};

const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

var self = module.exports = {
	getTimeline: function(req, res) {
		var offset = req.param('offset');
		if (!offset) {
			offset = 0;
		}
		TimelineService.getTimeline(req.param('deputyId'), parseInt(offset))
		.then(function(timelineItems) {
			if (!timelineItems) {
				return res.notFound('Could not find timeline items, sorry.');
			}
			return res.json(timelineItems);
		}).catch(function(err) {
      sails.log.error(err);
			return res.negotiate(err);
    });
	},
};

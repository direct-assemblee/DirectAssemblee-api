var self = module.exports = {
	sendPushNotif: function(req, res) {
		var deputyId = req.param('deputyId');
		var type = req.param('type');
		if (deputyId && Constants.WORK_TYPES.includes(type)) {
			TestService.sendPush(deputyId, type);
			return res.json(200);
		} else {
			return res.json(400, 'Must provide deputyId and valid type arguments')
		}
	}
};

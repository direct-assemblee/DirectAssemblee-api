// vote_solemn, vote_ordinary, vote_other, vote_motion_of_censure
//  / question / report / law_proposal / cosigned_law_proposal
// / commission / public_session

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

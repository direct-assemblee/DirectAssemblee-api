module.exports = {
	getBallots: function(req, res) {
		let offset = req.param('page') ? parseInt(req.param('page')) : 0;
		return BallotService.findBallots(offset)
		.then(function(ballots) {
			return res.json(ballots)
		})
	},

	getBallotDetails: function(req, res) {
		let id = req.param('id');
		let departmentId = req.param('departmentId');
		let district = req.param('district');
		if (id && departmentId && district) {
			return BallotService.getBallotWithIdAndDeputyVote(id, departmentId, district)
			.then(function(ballot) {
				if (ballot) {
					res.json(ballot);
				} else {
					return res.json(404, 'Could not find ballot with id ' + id);
				}
			})
		} else {
			return res.json(400, 'Must provide id, departmentId and district as parameters.');
		}
	}
};

let Promise = require('bluebird');
let DeputyController = require('../controllers/DeputyController.js');
let CacheService = require('../services/CacheService.js');
let VoteService = require('../services/VoteService.js');

module.exports = {
	getVotes: function(req, res) {
		let ballotId = req.param('ballotId');
		if (!ballotId) {
			return res.status(400).json('Must provide ballotId as a parameter.');
		} else {
			let key = 'votes_' + ballotId
			return CacheService.get(key)
			.then(function(cached) {
				if (!cached) {
					return DeputyController.getAllDeputies()
					.then(function(allDeputies) {
						let fors = []
						let againsts = []
						let nonvotings = []
						let blanks = []
						let missings = []
						return VoteService.findVotes(ballotId)
						.then(function(votes) {
							return Promise.map(votes, function(vote) {
								for (i = allDeputies.length - 1 ; i >= 0 ; i--) {
									if (allDeputies[i].id == vote.deputyId) {
										let deputy = allDeputies[i]
										switch(vote.value) {
											case 'for':
											fors.push(deputy);
											break;
											case 'against':
											againsts.push(deputy);
											break;
											case 'blank':
											blanks.push(deputy);
											break;
											case 'non-voting':
											nonvotings.push(deputy);
											break;
										}
										allDeputies.splice(i, 1)
									}
								}
							})
							.then(function() {
								let result = { 'for': fors, 'against': againsts, 'missing': allDeputies, 'non-voting': nonvotings, 'blank': blanks }
								CacheService.set(key, result);
								return res.status(200).json(result);
							})
						})
					})
				} else {
					return res.status(200).json(cached);
				}
			})
		}
	}
};

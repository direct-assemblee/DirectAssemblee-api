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
						return VoteService.findVotes(ballotId)
						.then(function(votes) {
							return Promise.each(votes, function(vote) {
								for (i = allDeputies.length - 1 ; i >= 0 ; i--) {
									if (allDeputies[i].id == vote.deputyId) {
										let deputy = allDeputies[i]
										switch(vote.value) {
											case 'for':
											fors.push(vote.deputyId);
											break;
											case 'against':
											againsts.push(vote.deputyId);
											break;
											case 'blank':
											blanks.push(vote.deputyId);
											break;
											case 'non-voting':
											nonvotings.push(vote.deputyId);
											break;
										}
									}
								}
								return votes;
							})
							.then(function() {
								return Promise.filter(allDeputies, function(deputy) {
									return !(fors.includes(deputy.id) || againsts.includes(deputy.id) || blanks.includes(deputy.id) || nonvotings.includes(deputy.id))
								})
							})
							.then(function(missings) {
								let result = {
									'for': getDeputies(allDeputies, fors),
		 							'against': getDeputies(allDeputies, againsts),
									'missing': missings,
								  'nonVoting': getDeputies(allDeputies, nonvotings),
									'blank': getDeputies(allDeputies, blanks)
							 	}
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

let getDeputies = function(allDeputies, ids) {
	let deputies = []
	for (let i in ids) {
		deputies.push(getDeputy(allDeputies, ids[i]))
	}
	return deputies
}

let getDeputy = function(allDeputies, id) {
	for (let i in allDeputies) {
		if (allDeputies[i].id == id) {
			return allDeputies[i]
		}
	}
}

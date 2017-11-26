let DeputyService = require('../services/DeputyService.js');
let SubscriberService = require('../services/SubscriberService.js');

module.exports = {
	subscribeToDeputy: function(req, res) {
		let token = req.param('token');
		let deputyId = req.param('deputyId');
		if (token && deputyId) {
			return subscribe(token, deputyId)
			.then(function(response) {
				return res.status(response.code).json(response.content);
			});
		} else {
			return res.status(400).json('Must provide deputyId and token arguments');
		}
	},

	unsubscribeToDeputy: function(req, res) {
		let token = req.param('token');
		var deputyId = req.param('deputyId');
		if (token && deputyId) {
			return unsubscribe(token, deputyId)
			.then(function(response) {
				return res.status(response.code).json(response.content);
			});
		} else {
			return res.json(400, 'Must provide deputyId and token arguments')
		}
	}
};

let subscribe = function(token, deputyId) {
	return DeputyService.findDeputyAndSubscribers(deputyId)
	.then(function(deputy) {
		if (!deputy) {
			return { code: 404, content: 'could not find deputy, sorry.' };
		} else {
			return SubscriberService.findSubscriber(token)
			.then(function(subscriber) {
				if (!subscriber) {
					console.log('creating subscriber in DB with token ' + token);
					return SubscriberService.createSubscriber(token)
				} else {
					console.log('existing subscriber in db');
					return subscriber;
				}
			})
			.then(function(subscriber) {
				if (deputyHasSubcriber(deputy, subscriber)) {
					console.log('subscriber with id ' + subscriber.id + ' already included in deputy ' + deputy.officialId + ' subscribers');
					return subscriber;
				} else {
					console.log('adding subscriber with id ' + subscriber.id + ' to deputy ' + deputy.officialId);
					return DeputyService.addSubscriber(deputy.officialId, subscriber);
				}
			})
			.then(function(subscriber) {
				return addSubscriptionToFirebase(token, deputyId)
				.then(function(err) {
					if (err) {
						console.log('error on Firebase subcription with token ' + token + ' and deputy ' + deputyId + ' ==> removing subscriber with id ' + subscriber.id + ' from deputy');
						return removeSubscriber(deputyId, subscriber, token)
						.then(function() {
							return { code: 400, content: err };
						})
					} else {
						return { code: 200, content: '' };
					}
				});
			})
		}
	})
}

let unsubscribe = function(token, deputyId) {
	return SubscriberService.findSubscriber(token)
	.then(function(subscriber) {
		if (subscriber) {
			return DeputyService.findDeputyWithId(deputyId)
			.then(function(deputy) {
				if (!deputy) {
					return { code: 404, content: 'could not find deputy with id ' + deputyId };
				} else {
					console.log('existing subscriber with token ' + token + ' ==> removing subscriber from deputy ' + deputyId);
					return removeSubscriber(deputyId, subscriber, token)
					.then(function() {
						return { code: 200, content: '' };
					})
				}
			})
		} else {
			console.log('subscriber with token ' + token + ' doesn\'t exist in DB')
			return { code: 200, content: '' };
		}
	})
}

let removeSubscriber = function(deputyId, subscriber, token) {
	return DeputyService.removeSubscriber(deputyId, subscriber)
	.then(function() {
		return SubscriberService.deleteSubscriber(token)
	})
}

let addSubscriptionToFirebase = function(token, deputyId) {
	return PushNotifService.addSubscriberToDeputy(token, deputyId)
	.then(function(result) {
		console.log('added Firebase subscription with token ' + token + ' and deputy ' + deputyId + ' ==> result : ' +  result)
		return;
	})
	.catch(function(err) {
		return err;
	});
}

let deputyHasSubcriber = function(deputy, subscriber) {
	let result = false;
	for (let i in deputy.subscribers) {
		if (deputy.subscribers[i].id === subscriber.id) {
			result = true;
			break;
		}
	}
	return result;
}

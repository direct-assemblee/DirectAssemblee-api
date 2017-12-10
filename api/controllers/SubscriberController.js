let DeputyService = require('../services/DeputyService.js');
let SubscriberService = require('../services/SubscriberService.js');

module.exports = {
	subscribeToDeputy: function(req, res) {
		let instanceId = req.param('instanceId');
		let token = req.param('token');
		let deputyId = req.param('deputyId');
		if (instanceId && token && deputyId) {
			return subscribe(instanceId, token, deputyId)
			.then(function(response) {
				return res.status(response.code).json(response.content);
			});
		} else {
			return res.status(400).json('Must provide deputyId and instanceId and token arguments');
		}
	},

	unsubscribeToDeputy: function(req, res) {
		let instanceId = req.param('instanceId');
		let deputyId = req.param('deputyId');
		if (instanceId && deputyId) {
			return unsubscribe(instanceId, deputyId)
			.then(function(response) {
				return res.status(response.code).json(response.content);
			});
		} else {
			return res.status(400).json('Must provide deputyId and instanceId arguments');
		}
	}
};

let subscribe = function(instanceId, token, deputyId) {
	return DeputyService.findDeputyAndSubscribers(deputyId)
	.then(function(deputy) {
		if (!deputy) {
			return { code: 404, content: 'could not find deputy, sorry.' };
		} else {
			return SubscriberService.createOrUpdateSubscriber(instanceId, token)
			.then(function(subscriber) {
				if (deputyHasSubcriber(deputy, subscriber)) {
					console.log('subscriber with instanceId ' + subscriber.instanceId + ' already included in deputy ' + deputy.officialId + ' subscribers');
					return subscriber;
				} else {
					console.log('adding subscriber with instanceId ' + instanceId + ' to deputy ' + deputy.officialId);
					return DeputyService.addSubscriber(deputy.officialId, instanceId);
				}
			})
			.then(function(subscriber) {
				return addSubscriptionToFirebase(token, deputyId)
				.then(function(err) {
					if (err) {
						console.log('error on Firebase subcription with token ' + token + ' and deputy ' + deputyId + ' ==> removing subscriber with id ' + subscriber.id + ' from deputy');
						return { code: 400, content: err };
					} else {
						return { code: 200, content: '' };
					}
				});
			})
		}
	})
}

let unsubscribe = function(instanceId, deputyId) {
	return SubscriberService.findSubscriber(instanceId)
	.then(function(subscriber) {
		if (subscriber) {
			return DeputyService.findDeputyWithId(deputyId)
			.then(function(deputy) {
				if (!deputy) {
					return { code: 404, content: 'could not find deputy with id ' + deputyId };
				} else {
					console.log('existing subscriber with instanceId ' + instanceId + ' ==> removing subscriber from deputy ' + deputyId);
					return removeSubscriptionFromFirebase(subscriber.token, deputyId)
					.then(function(err) {
						if (err) {
							console.log('error on Firebase subcription with token ' + subscriber.token + ' and deputy ' + deputyId + ' ==> removing subscriber with id ' + subscriber.id + ' from deputy');
							return { code: 400, content: err };
						} else {
							return removeSubscriber(deputyId, subscriber.instanceId)
							.then(function() {
								return { code: 200, content: '' };
							})
						}
					});
				}
			})
		} else {
			console.log('subscriber with instanceId ' + instanceId + ' doesn\'t exist in DB')
			return { code: 200, content: '' };
		}
	})
}

let removeSubscriber = function(deputyId, instanceId) {
	return DeputyService.removeSubscriber(deputyId, instanceId)
	.then(function() {
		return SubscriberService.deleteSubscriber(instanceId)
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

let removeSubscriptionFromFirebase = function(token, deputyId) {
	return PushNotifService.removeSubscriberFromDeputy(token, deputyId)
	.then(function(result) {
		console.log('removed Firebase subscription for token ' + token + ' and deputy ' + deputyId + ' ==> result : ' +  result)
		return;
	})
	.catch(function(err) {
		return err;
	});
}

let deputyHasSubcriber = function(deputy, subscriber) {
	let result = false;
	for (let i in deputy.subscribers) {
		if (deputy.subscribers[i].instanceId === subscriber.instanceId) {
			result = true;
			break;
		}
	}
	return result;
}

/**
 * SubscriberController
 *
 * @description :: Server-side logic for managing subscribers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var self = module.exports = {
	subscribeToDeputy: function(req, res) {
		var token = req.param('token');
		var deputyId = req.param('deputyId');
		if (token && deputyId) {
			return Deputy.findOne({ id: deputyId })
			.then(function(deputy) {
				if (!deputy) {
					return res.json(404, 'could not find deputy, sorry.');
				} else {
					return Subscriber.findOne()
					.where({ token: token })
					.then(function(subscriber) {
						if (subscriber) {
	            console.log("existing subscriber in db")
							deputy.subscribers.add(subscriber.id)
						} else {
	            console.log("adding new subscriber to db")
							deputy.subscribers.add({ token : token })
						}
						deputy.save()
					})
	        .then(function() {
	          return PushNotifService.addSubscriberToDeputy(token, deputyId)
	          .then(function(result) {
	            console.log("added subscription to firebase")
							return res.json(200);
	          })
	          .catch(function(err) {
				      return res.json(400, err);
	          });
	        })
				}
			})
		} else {
			return res.json(400, 'Must provide deputyId and token arguments')
		}
	}
};

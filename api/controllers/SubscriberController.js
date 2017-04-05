/**
 * SubscriberController
 *
 * @description :: Server-side logic for managing subscribers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var self = module.exports = {
  _config: {
    actions: true,
    shortcuts: true,
    rest: true
  },

	addSubscriberToDepute: function(req, res) {
		var token = req.param('token');
		var deputeId = req.param('deputeId');
		Depute.findOne({ id: deputeId })
		.then(function(depute) {
			if (!depute) {
				return res.notFound('could not find depute, sorry.');
			} else {
				return Subscriber.findOne()
				.where({ token: token })
				.then(function(subscriber) {
					if (subscriber) {
            console.log("existing subscriber in db")
						depute.subscribers.add(subscriber.id)
					} else {
            console.log("adding new subscriber to db")
						depute.subscribers.add({ token : token })
					}
					depute.save()
          return subscriber;
				})
        .then(function(subscriber) {
          console.log(subscriber.token);
          return PushNotifService.addSubscriberToDepute(subscriber.token, deputeId)
          .then(function(result) {
            console.log(result);
            console.log("added subscribption to firebase")
          })
          .catch(function(err) {
            console.log(err);
          });
        })
			}
		})
	}
};

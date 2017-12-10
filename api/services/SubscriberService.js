let self = module.exports = {
    findSubscriber: function(instanceId) {
        return Subscriber.findOne()
        .where({ instanceId: instanceId })
    },

    createOrUpdateSubscriber: function(instanceId, token) {
        return self.findSubscriber(instanceId)
        .then(function(subscriber) {
            if (subscriber) {
                return updateSubscriber(subscriber, token)
            } else {
                return createSubscriber(instanceId, token);
            }
        })
    },

    deleteSubscriber: function(instanceId) {
        return Subscriber.destroy({ instanceId: instanceId });
    }
}

let createSubscriber = function(instanceId, token) {
	console.log('creating subscriber in DB with instanceId ' + instanceId + ' and token ' + token);
    return Subscriber.create({ instanceId: instanceId, token: token })
    .meta({ fetch: true });
}

let updateSubscriber = function(subscriber, token) {
	console.log('creating subscriber in DB with instanceId ' + subscriber.instanceId + ' and token ' + token);
    return Subscriber.update()
    .where({ instanceId: subscriber.instanceId })
    .set({ token: token })
    .meta({ fetch: true });
}

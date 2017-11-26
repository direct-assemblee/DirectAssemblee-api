module.exports = {
    findSubscriber: function(token) {
        return Subscriber.findOne()
        .where({ token: token })
    },

    createSubscriber: function(token) {
        return Subscriber.create({token: token})
        .meta({fetch: true});
    },

    deleteSubscriber: function(token) {
        return Subscriber.destroy({token: token});
    }
}

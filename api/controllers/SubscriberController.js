/**
* SubscriberController
*
* @description :: Server-side logic for managing subscribers
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

var self = module.exports = {
    subscribeToDeputy: function(req, res) {
        var token = req.param('token')
        var deputyId = req.param('deputyId')
        if (token && deputyId) {
            return Deputy.findOne({ officialId: deputyId })
                .then(function(deputy) {
                    if (!deputy) {
                        return res.json(404, 'could not find deputy, sorry.')
                    } else {
                        return Subscriber.findOne()
                            .where({ token: token })
                            .then(function(subscriber) {
                                if (subscriber) {
                                    console.log('existing subscriber in db')
                                    deputy.subscribers.add(subscriber.id)
                                } else {
                                    console.log('adding new subscriber to db')
                                    deputy.subscribers.add({ token : token })
                                }
                                deputy.save()
                                return addSubscriptionToFirebase(token, deputyId)
                                    .then(function(err) {
                                        if (err) {
                                            return res.json(400, err)
                                        } else {
                                            return res.json(200)
                                        }
                                    })
                            })
                    }
                })
        } else {
            return res.json(400, 'Must provide deputyId and token arguments')
        }
    },

    unsubscribeToDeputy: function(req, res) {
        var token = req.param('token')
        var deputyId = req.param('deputyId')
        if (token && deputyId) {
            return Subscriber.findOne()
                .where({ token: token })
                .then(function(subscriber) {
                    if (subscriber) {
                        return Deputy.findOne({ officialId: deputyId })
                            .then(function(deputy) {
                                if (!deputy) {
                                    return res.json(404, 'could not find deputy with id ' + deputyId)
                                } else {
                                    console.log('existing subscriber - remove from db if exists with deputy collection')
                                    deputy.subscribers.remove(subscriber.id)
                                    return removeSubscriptionFromFirebase(token, deputyId)
                                        .then(function(err) {
                                            if (err) {
                                                return res.json(400, err)
                                            } else {
                                                return res.json(200)
                                            }
                                        })
                                }
                            })
                    } else {
                        console.log('subscriber doesn\'t exist in DB')
                        return res.json(200)
                    }
                })
        } else {
            return res.json(400, 'Must provide deputyId and token arguments')
        }
    }
}

var addSubscriptionToFirebase = function(token, deputyId) {
    return PushNotifService.addSubscriberToDeputy(token, deputyId)
        .then(function(result) {
            console.log('added subscription to firebase')
            return
        })
        .catch(function(err) {
            sails.log.error(err)
            return err
        })
}

var removeSubscriptionFromFirebase = function(token, deputyId) {
    return PushNotifService.removeSubscriberFromDeputy(token, deputyId)
        .then(function(result) {
            console.log('removed firebase subscription : ' + result.toString())
            return
        })
        .catch(function(err) {
            sails.log.error(err)
            return err
        })
}

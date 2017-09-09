let admin = require('firebase-admin');
let request = require('request-promise')
let serviceAccount = require('../../assets/firebase_service_account.json');
let ResponseHelper = require('./helpers/ResponseHelper.js');

const serverKey = 'AAAATv-4Kqk:APA91bGXc-kCx6EsfzWRqNDZ9OBzqHs30MzRv1QNz00FbtrufnAfjr3eZOKmaw0DVHKGITkbjAxypt9Q138LboGArpMFhsuzcR02U1m3R7eqHyT0pibcDi7cCul-WD5ITGx6cZrmheXt';

const COLLAPSE_KEY = 'NOTIF_VOTE';
const FIREBASE_INSTANCE_ID_SERVICE_URL = 'https://iid.googleapis.com/iid/';
const PARAM_IID_TOKEN = '{IID_TOKEN}';
const PARAM_TOPIC_NAME = '{TOPIC_NAME}';
const PARAM_TOPIC_PREFIX_DEPUTY = 'DEPUTY_';
const ADD_TO_TOPIC_URL = FIREBASE_INSTANCE_ID_SERVICE_URL + 'v1/' + PARAM_IID_TOKEN + '/rel/topics/' + PARAM_TOPIC_NAME;
const REMOVE_FROM_TOPIC_URL = FIREBASE_INSTANCE_ID_SERVICE_URL + 'v1:batchRemove';
const RANGE_STEP = 20;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://directassemblee-d4b5a.firebaseio.com'
});

module.exports = {
    addSubscriberToDeputy: function(token, deputyId) {
        return new Promise(function(resolve, reject) {
            let url = ADD_TO_TOPIC_URL.replace(PARAM_IID_TOKEN, token).replace(PARAM_TOPIC_NAME, PARAM_TOPIC_PREFIX_DEPUTY + deputyId)
            const options = {
                method: 'POST',
                uri: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': 0,
                    'Authorization': 'key=' + serverKey
                }
            }
            request(options)
            .then(function(response) {
                resolve(response);
            })
            .catch(function(err) {
                let error = 'addSubscriberToDeputy : ' + err.statusCode + ' ' + err.error;
                sails.log.error(error);
                reject(err.error);
            })
        })
    },

    removeSubscriberFromDeputy: function(token, deputyId) {
        return new Promise(function(resolve, reject) {
            let url = REMOVE_FROM_TOPIC_URL;
            let bodyContent = {
                'to' : '/topics/' + PARAM_TOPIC_PREFIX_DEPUTY + deputyId,
                'registration_tokens': [ token ]
            }
            const options = {
                method: 'POST',
                uri: url,
                headers: {
                    'Authorization': 'key=' + serverKey
                },
                body: bodyContent,
                json: true
            }
            request(options)
            .then(function(response) {
                resolve(response);
            })
            .catch(function(err) {
                console.log('removeSubscriberFromDeputy : ' + err.toString());
                reject(err.error);
            })
        })
    },

    pushDeputyActivities: function(deputyActivities) {
        return pushDeputyActivitiesByRange(deputyActivities.deputyId, deputyActivities.activities, 0)
    }
}

let pushDeputyActivitiesByRange = function(deputyId, activities, start) {
    let end = start + RANGE_STEP;
    if (end > activities.length) {
        end = activities.length;
    }
    let activitiesRange = activities.slice(start, end);
    return pushDeputyActivities(deputyId, activitiesRange)
    .then(function() {
        let newStart = start + RANGE_STEP
        if (newStart < activities.length) {
            return pushDeputyActivitiesByRange(deputyId, activities, newStart)
        } else {
            return;
        }
    })
}

let pushDeputyActivities = function(deputyId, activities) {
    let promises = [];
    for (let i in activities) {
        promises.push(pushDeputyActivity(deputyId, activities[i]));
    }
    return Promise.all(promises);
}

let pushDeputyActivity = function(deputyId, deputyActivity) {
    let payload = ResponseHelper.createPayloadForActivity(deputyId, deputyActivity)
    console.log('title : ' + payload.notification.title)
    console.log('body : ' + payload.notification.body)
    console.log('deputyId : ' + payload.data.deputyId)
    console.log('ballotId : ' + payload.data.ballotId)
    let options = {
        collapseKey: COLLAPSE_KEY,
    };

    return admin.messaging().sendToTopic(PARAM_TOPIC_PREFIX_DEPUTY + deputyId, payload, options)
    .then(function(response) {
        console.log('Successfully sent message - received id: ', response);
        return;
    })
    .catch(function(error) {
        console.log('Error sending message:', error);
        return;
    });
}

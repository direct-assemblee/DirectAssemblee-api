let admin = require('firebase-admin');
let request = require('request-promise')
let Promise = require('bluebird');
let CronJob = require('cron').CronJob;
let ResponseHelper = require('./helpers/ResponseHelper.js');
let serviceAccount = require('../../config/env/firebase_service_account.js');
const serverKey = serviceAccount.serverKey;

const PUSH_DAILY_REPORT_TIME = sails.config.cronPush
const COLLAPSE_KEY = 'NOTIF_VOTE';
const FIREBASE_INSTANCE_ID_SERVICE_URL = 'https://iid.googleapis.com/iid/';
const PARAM_IID_TOKEN = '{IID_TOKEN}';
const PARAM_TOPIC_NAME = '{TOPIC_NAME}';
const PARAM_TOPIC_PREFIX_DEPUTY = 'DEPUTY_v0_';
const ADD_TO_TOPIC_URL = FIREBASE_INSTANCE_ID_SERVICE_URL + 'v1/' + PARAM_IID_TOKEN + '/rel/topics/' + PARAM_TOPIC_NAME;
const REMOVE_FROM_TOPIC_URL = FIREBASE_INSTANCE_ID_SERVICE_URL + 'v1:batchRemove';
const RANGE_STEP = 20;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://directassemblee-d4b5a.firebaseio.com'
});

let self = module.exports = {
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

    startDailyVotesCron: function() {
        console.log('starting cron for daily reports')
        new CronJob(PUSH_DAILY_REPORT_TIME, function() {
            self.sendDailyReportForBallots()
        }, null, true, 'Europe/Paris');
    },

    pushDeputyActivities: function(deputyId, activities) {
        return pushDeputyActivitiesByRange(deputyId, activities, 0)
    },

    pushDeputyDailyVotes: async function(deputyId, dailyVotes) {
        if (await DeputyService.hasSubscribers(deputyId)) {
            return Promise.delay(60000)
            .then(async () => {
                let payload = await self.createPayloadForDailyVotes(deputyId, dailyVotes)
                // console.log('title : ' + payload.notification.title)
                // console.log('body : ' + payload.notification.body)
                // console.log('deputyId : ' + payload.data.deputyId)
                // console.log('workId : ' + payload.data.workId)
                return pushPayloadForSubject(PARAM_TOPIC_PREFIX_DEPUTY + deputyId, payload)
            })
        } else {
            console.log('deputy : ' + deputyId + ' doesn\'t have any subscribers')
        }
    },

    sendDailyReportForBallots: function() {
        console.log('start preparing daily reports')
        return LastWorksService.findLast24hVotes()
        .then(newVotesByDeputy => {
            if (newVotesByDeputy && newVotesByDeputy.length > 0) {
                console.log('- new votes to be pushed for the last 24h')
                return Promise.map(newVotesByDeputy, deputyVotes => {
                    return self.pushDeputyDailyVotes(deputyVotes.deputyId, deputyVotes.activities);
                }, {concurrency: 10})
            } else {
                console.log('- no new votes to be pushed for the last 24h')
            }
            return;
        })
    },

    createPayloadForDailyVotes: async function(deputyId, dailyVotes) {
        let payload = await self.getPayloadValuesForDailyVotes(dailyVotes)
        return ResponseHelper.createPayloadForDailyVotes(deputyId, dailyVotes.length,
            payload.theme, payload.value,payload.counts)
    },

    getPayloadValuesForDailyVotes: async function(dailyVotes) {
        let counts = {
            for : 0,
            against : 0,
            blank : 0,
            missing : 0,
            nonVoting : 0,
        };

        let allSameValue = true;
        let allSameThemeId = true;
        let firstValue;
        let firstThemeId;
        for (let i in dailyVotes) {
            let vote =  dailyVotes[i];
            if (!firstValue) {
                firstValue = vote.value;
                firstThemeId = vote.themeId;
            } else {
                allSameValue = allSameValue && vote.value === firstValue;
                allSameThemeId = allSameThemeId && vote.themeId === firstThemeId;
            }
            switch (dailyVotes[i].value) {
                case 'for':
                counts.for++;
                break;
                case 'against':
                counts.against++;
                break;
                case 'blank':
                counts.blank++;
                break;
                case 'missing':
                counts.missing++;
                break;
                case 'non-voting':
                counts.nonVoting++;
                break;
            }
        }
        let theme = null;
        if (allSameThemeId) {
            theme = await SubthemeService.find(firstThemeId);
            if (theme != null) {
                theme = theme.name
            }
        }
        return {
            theme: theme,
            value: allSameValue ? firstValue : null,
            counts: counts,
        }
    }
}

let pushDeputyActivitiesByRange = function(deputyId, activities, start) {
    if (activities) {
        let end = start + RANGE_STEP;
        if (end > activities.length) {
            end = start + activities.length;
        }
        let activitiesRange = activities.slice(start, end);
        return pushDeputyActivitiesIfSubscribers(deputyId, activitiesRange)
        .then(function() {
            let newStart = start + RANGE_STEP
            if (newStart < activities.length) {
                return pushDeputyActivitiesByRange(deputyId, activities, newStart)
            } else {
                return;
            }
        })
    } else {
        return;
    }
}

let pushDeputyActivitiesIfSubscribers = async function(deputyId, activities) {
    if (await DeputyService.hasSubscribers(deputyId)) {
        console.log('- deputy ' + deputyId + ' has ' + activities.length + ' activities to be pushed')
        return pushDeputyActivities(deputyId, activities)
    }
}

let pushDeputyActivities = function(deputyId, activities) {
    let promises = [];
    for (let i in activities) {
        promises.push(pushDeputyActivity(deputyId, activities[i]));
    }
    return Promise.all(promises);
}

let pushDeputyActivity = function(deputyId, deputyActivity) {
    return ResponseHelper.createPayloadForActivity(deputyId, deputyActivity)
    .then(function(payload) {
        // console.log('title : ' + payload.notification.title)
        // console.log('body : ' + payload.notification.body)
        // console.log('deputyId : ' + payload.data.deputyId)
        // console.log('workId : ' + payload.data.workId)
        return pushPayloadForSubject(PARAM_TOPIC_PREFIX_DEPUTY + deputyId, payload)
    })
}

let pushPayloadForSubject = function(subject, payload) {
    let options = {
        collapseKey: COLLAPSE_KEY,
    };
    return admin.messaging().sendToTopic(subject, payload, options)
    .then(function(response) {
        // console.log('Successfully sent message - received id: ', response);
        return;
    })
    .catch(function(error) {
        console.log('Error sending message:', error);
        return;
    });
}

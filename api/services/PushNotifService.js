var admin = require("firebase-admin");
var request = require('request-promise')
var serviceAccount = require("./keys/firebase-service-account.json");
var ResponseHelper = require('./helpers/ResponseHelper.js');

const serverKey = 'AAAAcG1FX-Q:APA91bGzbAdIxR7t9xcGSVliY2mK8iWPsPTR8vx16Du-kdMRiHw-7DOBvbg-Y0X2-W9BxCVcJAJd3rRPaV6Mr0LIb1SFKVcDhkGqSLVyVfd6N4DNcb_4VKG_9NzXnCr4VfSLBQaayRE3'

const COLLAPSE_KEY = "NOTIF_VOTE";
const FIREBASE_INSTANCE_ID_SERVICE_URL = "https://iid.googleapis.com/iid/";
const PARAM_IID_TOKEN = "{IID_TOKEN}";
const PARAM_TOPIC_NAME = "{TOPIC_NAME}";
const PARAM_TOPIC_PREFIX_DEPUTY = "DEPUTY_";
const ADD_TO_TOPIC_URL = FIREBASE_INSTANCE_ID_SERVICE_URL + "v1/" + PARAM_IID_TOKEN + "/rel/topics/" + PARAM_TOPIC_NAME;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://directassemblee-77a91.firebaseio.com"
});

var self = module.exports = {
  addSubscriberToDeputy: function(token, deputyId) {
    return new Promise(function (resolve, reject) {
      var url = ADD_TO_TOPIC_URL.replace(PARAM_IID_TOKEN, token).replace(PARAM_TOPIC_NAME, PARAM_TOPIC_PREFIX_DEPUTY + deputyId)
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
      .then(function (response) {
        resolve(response);
      })
      .catch(function (err) {
        console.log(err)
        // Deal with the error
        // var respErr = JSON.parse(err.error);
        // console.log(respErr)
        // var errorResult = {
        //   origUrl: url,
        //   error: respErr
        // };
        reject(err);
      })
    })
  },

  pushDeputyActivities: function(deputyActivities) {
    var promises = [];
    for (var i in deputyActivities.activities) {
      promises.push(pushDeputyActivity(deputyActivities.deputyId, deputyActivities.activities[i]));
    }
    return Promise.all(promises);
  },
}

var pushDeputyActivity = function(deputyId, deputyActivity) {
  var payload = ResponseHelper.createPayloadForActivity(deputyId, deputyActivity)
  // console.log(payload.notification.title)
  // console.log(payload.notification.body)
  var options = {
    collapseKey: COLLAPSE_KEY,
  };

  return admin.messaging().sendToTopic(PARAM_TOPIC_PREFIX_DEPUTY + deputyId, payload, options)
  .then(function(response) {
    // console.log("Successfully sent message - received id: ", response.messageId);
  })
  .catch(function(error) {
    console.log("Error sending message:", error);
  });
}

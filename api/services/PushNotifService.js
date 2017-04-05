var admin = require("firebase-admin");
var request = require('request-promise')
var serviceAccount = require("./keys/firebase-service-account.json");

const serverKey = 'AAAAcG1FX-Q:APA91bGzbAdIxR7t9xcGSVliY2mK8iWPsPTR8vx16Du-kdMRiHw-7DOBvbg-Y0X2-W9BxCVcJAJd3rRPaV6Mr0LIb1SFKVcDhkGqSLVyVfd6N4DNcb_4VKG_9NzXnCr4VfSLBQaayRE3'

const COLLAPSE_KEY = "NOTIF_VOTE";
const FIREBASE_INSTANCE_ID_SERVICE_URL = "https://iid.googleapis.com/iid/";
const PARAM_IID_TOKEN = "{IID_TOKEN}";
const PARAM_TOPIC_NAME = "{TOPIC_NAME}";
const PARAM_TOPIC_PREFIX_DEPUTE = "DEPUTE_";
const ADD_TO_TOPIC_URL = FIREBASE_INSTANCE_ID_SERVICE_URL + "v1/" + PARAM_IID_TOKEN + "/rel/topics/" + PARAM_TOPIC_NAME;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://directassemblee-77a91.firebaseio.com"
});

var self = module.exports = {
  addSubscriberToDepute: function(token, deputeId) {
    return new Promise(function (resolve, reject) {
      var url = ADD_TO_TOPIC_URL.replace(PARAM_IID_TOKEN, token).replace(PARAM_TOPIC_NAME, PARAM_TOPIC_PREFIX_DEPUTE + deputeId)
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

  prepareMessage: function(token) {
    var message = {
      to: token, // required fill with device token or topics
      collapse_key: COLLAPSE_KEY,
      data: {
          your_custom_data_key: 'your_custom_data_value'
      },
      notification: {
          title: 'Title of your push notification',
          body: 'Body of your push notification'
      }
    };
  },

  pushDeputeVotes: function(deputeVotes) {
    for (var i in deputeVotes.votes) {
      self.pushDeputeVote(deputeVotes.depute, deputeVotes.votes[i]);
    }
  },

  pushDeputeVote: function(depute, deputeVote) {
    console.log(deputeVote)
    var payload = {
      notification: {
        title: depute.name + " a voté " + deputeVote.value,
        body: "" + deputeVote.lawTitle
      },
      data: {
        deputeId:  "" + depute.id,
        lawId:  "" + deputeVote.lawId
      }
    };
    var options = {
      collapseKey: COLLAPSE_KEY,
    };
    admin.messaging().sendToTopic(PARAM_TOPIC_PREFIX_DEPUTE + depute.id, payload, options)
    .then(function(response) {
      // See the MessagingTopicResponse reference documentation for the
      // contents of response.
      console.log("Successfully sent message - received id: ", response.messageId);
    })
    .catch(function(error) {
      console.log("Error sending message:", error);
    });
  }
}

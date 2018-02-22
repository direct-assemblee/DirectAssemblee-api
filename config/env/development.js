/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

    firebase: {
        configFile: 'firebase_service_account_dev.json',
        serverKey: 'AAAATv-4Kqk:APA91bGXc-kCx6EsfzWRqNDZ9OBzqHs30MzRv1QNz00FbtrufnAfjr3eZOKmaw0DVHKGITkbjAxypt9Q138LboGArpMFhsuzcR02U1m3R7eqHyT0pibcDi7cCul-WD5ITGx6cZrmheXt',
    },

    gmap: {
        key: 'AIzaSyCwHl1AXUzENiz_VsABqZ8QIAHO5C-K8Js'
    },

    routes: {
        'GET /api/v1/testPushNotif' : 'PushNotifController.sendTestPushNotif', // ?deputyId=13&type={question/ballot/...}&workId=1212
    },

    cronPush: '0 15 18 * * *'
};

/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage'
  },

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/
'GET /api/v1/alldeputies': 'DeputyController.getAllDeputiesResponse',
'GET /api/v1/deputies': 'DeputyController.getDeputiesResponse',  // optional ?latitude=XXX&longitude=YYY
'GET /api/v1/deputy': 'DeputyController.getDeputyResponse',  // ?departmentId=13&district=12
'GET /api/v1/timeline': 'TimelineController.getTimeline', // ?deputyId=13&page=12 (page is optional)
'POST /api/v1/subscribe' : 'SubscriberController.subscribeToDeputy', // ?deputyId=13
'POST /api/v1/unsubscribe' : 'SubscriberController.unsubscribeToDeputy', // ?deputyId=13
'POST /api/v1/deputiesUpdated' : 'PushNotifController.deputiesUpdated', // ?deputyId=13
'POST /api/v1/ballotsUpdated' : 'PushNotifController.ballotsUpdated',
'POST /api/v1/resetCache' : 'CacheController.resetCache',
'GET /api/v1/votes': 'VoteController.getVotes',
'GET /api/v1/features': 'FeatureController.getFeatures',
'GET /api/v1/activityRates': 'StatsController.getActivityRates', // ?groupId=1 (optional)

'GET /v1/alldeputies': 'DeputyController.getAllDeputiesResponse',
'GET /v1/deputies': 'DeputyController.getDeputiesResponse',  // optional ?latitude=XXX&longitude=YYY
'GET /v1/deputy': 'DeputyController.getDeputyResponse',  // ?departmentId=13&district=12
'GET /v1/timeline': 'TimelineController.getTimeline', // ?deputyId=13&page=12 (page is optional)
'POST /v1/subscribe' : 'SubscriberController.subscribeToDeputy', // ?deputyId=13
'POST /v1/unsubscribe' : 'SubscriberController.unsubscribeToDeputy', // ?deputyId=13
'POST /v1/deputiesUpdated' : 'PushNotifController.deputiesUpdated', // ?deputyId=13
'POST /v1/ballotsUpdated' : 'PushNotifController.ballotsUpdated',
'POST /v1/resetCache' : 'CacheController.resetCache',
'GET /v1/votes': 'VoteController.getVotes',
'GET /v1/features': 'FeatureController.getFeatures',
'GET /v1/activityRates': 'StatsController.getActivityRates', // ?groupId=1 (optional)
'GET /v1/lawBallots': 'LawController.getLawBallots', // ?lawId=22&?deputyId=13
};

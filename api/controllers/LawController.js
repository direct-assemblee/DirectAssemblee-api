/**
 * LawController
 *
 * @description :: Server-side logic for managing laws
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

module.exports = {
		getLaws: function(req, res) {
			Law.find()
				.limit(actionUtil.parseLimit(req))
				.skip(actionUtil.parseSkip(req))
				.exec(function(err, laws) {
					if (err) {
						return res.json(err);
					}
					return res.json(laws)
				})
		},

		getLawWithId: function(req, res) {
			Law.findOne({ id : req.param('id') })
				.then(function(law) {
					return res.json(law);
				})
		}
};

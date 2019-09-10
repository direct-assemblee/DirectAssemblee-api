let Promise = require('bluebird');
let ThemeResponseHelper = require('./ThemeResponseHelper.js');
let LawResponseHelper = require('./LawResponseHelper.js');
let WorkResponseHelper = require('./WorkResponseHelper.js');
let BallotResponseHelper = require('./BallotResponseHelper.js');

module.exports = {
    formatTimelineResponse: function(items, deputy) {
    	let promises = [];
    	for (let i in items) {
    		let item = items[i];
    		if (item.lastBallotDate) {
                promises.push(createLawResponse(item, deputy))
    	    } else {
    			promises.push(WorkResponseHelper.createWorkResponse(item, item.extraInfos));
    		}
    	}
    	return Promise.all(promises);
    }
}

let createLawResponse = function(law, deputy) {
    return LawResponseHelper.createLawResponse(law)
    .then(lawResponse => {
        if (law.ballots) {
            return Promise.map(law.ballots, ballot => {
                return BallotResponseHelper.createBallotDetailsResponse(ballot, deputy)
            })
            .then(ballotsResponse => {
                lawResponse.ballots = ballotsResponse;
                return lawResponse
            })
        } else {
            return lawResponse
        }
    })
}

let Promise = require('bluebird');
let ResponseBuilder = require('./ResponseBuilder.js');
let DateHelper = require('../../services/helpers/DateHelper.js');
let ResponseHelper = require('../../services/helpers/ResponseHelper.js');
let ThemeResponseHelper = require('./ThemeResponseHelper.js');
let LawResponseHelper = require('./LawResponseHelper.js');
let BallotResponseHelper = require('./BallotResponseHelper.js');
let QuestionHelper = require('./QuestionHelper.js')
let WorkAndBallotTypeHelper = require('../../services/helpers/WorkAndBallotTypeHelper.js')

const NUMBER_OF_DEPUTIES = 577;

module.exports = {
    formatTimelineResponse: function(items, deputy) {
    	let promises = [];
    	for (let i in items) {
    		let item = items[i];
    		if (item.lastBallotDate) {
                promises.push(createLawResponse(item, deputy))
    	    } else {
    			promises.push(createWorkForTimeline(item, item.extraInfos));
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

let createWorkForTimeline = async function(work, extraInfos) {
    let type = await createWorkTypeResponse(work.type);
    let response = {
        id: work.id,
        type: type,
        date: DateHelper.formatDateForWS(work.date),
        fileUrl: work.url
    }

    response.theme = await ThemeResponseHelper.createThemeResponse(work.theme, work.originalThemeName);

    let description = work.description;
    if (WorkAndBallotTypeHelper.isQuestion(work.type)) {
        description = QuestionHelper.formatQuestionWithLineBreaks(description);
    }
    response.description = description;
    if (extraInfos && extraInfos.length > 0) {
        response.extraInfos = {};
        for (let i in extraInfos) {
            response.extraInfos[extraInfos[i].info] = extraInfos[i].value;
        }
    }
    if (WorkAndBallotTypeHelper.isCommission(work.type)) {
        if (response.extraInfos) {
            response.title = response.extraInfos['commissionName']
        }
    } else if (WorkAndBallotTypeHelper.isPublicSession(work.type)) {
        response.title = 'Séance publique'
    } else {
        if (WorkAndBallotTypeHelper.isProposition(work.type) && !work.isAuthor) {
            response.type = 'cosigned_law_proposal'
        }
        response.title = work.title
    }
    return response;
}

let createWorkTypeResponse = function(workType) {
    return WorkAndBallotTypeHelper.getWorkTypeName(workType)
}

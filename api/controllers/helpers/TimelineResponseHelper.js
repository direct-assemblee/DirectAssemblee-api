let Promise = require('bluebird');
let ResponseBuilder = require('./ResponseBuilder.js');
let DateHelper = require('../../services/helpers/DateHelper.js');
let ResponseHelper = require('../../services/helpers/ResponseHelper.js');
let QuestionHelper = require('./QuestionHelper.js')
let ShortThemeHelper = require('./ShortThemeHelper.js')
let WorkAndBallotTypeHelper = require('../../services/helpers/WorkAndBallotTypeHelper.js')

const BASE_URL = 'http://www2.assemblee-nationale.fr/';
const PARAM_DEPUTY_ID = '{deputy_id}';
const PARAM_MANDATE_NUMBER = '15';
const DEPUTY_PHOTO_URL = BASE_URL + 'static/tribun/' + PARAM_MANDATE_NUMBER + '/photos/' + PARAM_DEPUTY_ID + '.jpg'

const NUMBER_OF_DEPUTIES = 577;

var self = module.exports = {
    formatTimelineResponse: function(items, deputy) {
    	let promises = [];
    	for (let i in items) {
    		let item = items[i];
    		if (item.totalVotes > 0) {
    			promises.push(self.createBallotDetailsResponse(item, deputy));
    		} else {
    			promises.push(self.createWorkForTimeline(item, item.extraInfos));
    		}
    	}
    	return Promise.all(promises);
    },

    createBallotDetailsResponse: async function(ballot, deputy) {
        let ballotResponse = await self.prepareBallotResponse(ballot);
        let voteValue = ResponseHelper.createVoteValueForWS(ballot.type, ballot.deputyVote)
        ballotResponse.extraBallotInfo.deputyVote = {
            'voteValue': voteValue,
            'deputy': {
                'firstname': deputy.firstname,
                'lastname': deputy.lastname
            }
        }
        return ballotResponse
    },

    createWorkForTimeline: async function(work, extraInfos) {
        let type = await createWorkTypeResponse(work.type);
        let response = {
            id: work.id,
            type: type,
            date: DateHelper.formatDateForWS(work.date),
            fileUrl: work.url
        }

        response.theme = await createThemeResponse(work.theme, work.originalThemeName);

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
    },

    prepareBallotResponse: async function(ballot) {
        let theme = await createThemeResponse(ballot.theme, ballot.originalThemeName);
        return {
            id: parseInt(ballot.officialId),
            date: DateHelper.formatDateForWS(ballot.date),
            description: ballot.title,
            title: ballot.type.displayName,
            type: ballot.type.name,
            theme: theme,
            fileUrl: ballot.fileUrl,
            extraBallotInfo: {
                totalVotes: parseInt(ballot.totalVotes),
                yesVotes: parseInt(ballot.yesVotes),
                noVotes: parseInt(ballot.noVotes),
                nonVoting: parseInt(ballot.nonVoting),
                blankVotes: ballot.totalVotes - ballot.yesVotes - ballot.noVotes,
                missing: NUMBER_OF_DEPUTIES - parseInt(ballot.totalVotes) - parseInt(ballot.nonVoting),
                isAdopted: ballot.isAdopted ? true : false
            }
        }
    }
}

let createWorkTypeResponse = function(workType) {
    return WorkAndBallotTypeHelper.getWorkTypeName(workType)
}

let createThemeResponse = function(themeId, originalName) {
    return ThemeService.getThemefromId(themeId)
    .then(function(theme) {
        if (theme) {
            delete theme.typeName;
        } else {
            theme = {
                id: 0,
                name: 'Catégorisation à venir'
            }
        }
        if (shouldShowThemeSubName(theme.name, originalName)) {
            theme.fullName = originalName;
            theme.shortName = ShortThemeHelper.findShorterName(originalName);
        }
        return theme;
    })
}

let shouldShowThemeSubName = function(themeName, originalThemeName) {
    let shouldShow = true;
    if (!originalThemeName || originalThemeName.length === 0) {
        shouldShow = false;
    } else if (themeName == originalThemeName) {
        shouldShow = false;
    } else {
        if (themeName != null && themeName.toLowerCase().includes(originalThemeName.toLowerCase()) && (100 * originalThemeName.length / themeName.length >= 50)) {
            shouldShow = false;
        }
    }
    return shouldShow;
}

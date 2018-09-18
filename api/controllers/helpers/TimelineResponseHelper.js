let Promise = require('bluebird');
let ResponseBuilder = require('./ResponseBuilder.js');
let DateHelper = require('../../services/helpers/DateHelper.js');
let ResponseHelper = require('../../services/helpers/ResponseHelper.js');
let QuestionHelper = require('./QuestionHelper.js')
let ThemeHelper = require('./ThemeHelper.js')
let WorkAndBallotTypeHelper = require('../../services/helpers/WorkAndBallotTypeHelper.js')

const BASE_URL = 'http://www2.assemblee-nationale.fr/';
const PARAM_DEPUTY_ID = '{deputy_id}';
const PARAM_MANDATE_NUMBER = '15';
const DEPUTY_PHOTO_URL = BASE_URL + 'static/tribun/' + PARAM_MANDATE_NUMBER + '/photos/' + PARAM_DEPUTY_ID + '.jpg'

const NUMBER_OF_DEPUTIES = 577;

var self = module.exports = {
    formatTimelineResponse: function(items, deputy) {
    	let results = [];
    	for (let i in items) {
    		let item = items[i];
    		if (item.totalVotes > 0) {
    			item = self.createBallotDetailsResponse(item, deputy);
    		} else {
    			item = self.createWorkForTimeline(item, item.extraInfos);
    		}
    		results.push(item);
    	}
    	return results;
    },

    createBallotDetailsResponse: function(ballot, deputy) {
        let ballotResponse = self.prepareBallotResponse(ballot);
        let voteValue = ResponseHelper.createVoteValueForWS(ballot.type, ballot.deputyVote)
        ballotResponse.extraBallotInfo.deputyVote = {
            'voteValue': voteValue,
            'deputy': {
                'firstname': deputy.firstname,
                'lastname': deputy.lastname
            }
        }
        return ballotResponse;
    },

    createWorkForTimeline: function(work, extraInfos) {
        let response = {
            id: work.id,
            type: work.type.name,
            date: DateHelper.formatDateForWS(work.date),
            fileUrl: work.url
        }

        response.theme = createThemeResponse(work.themeId, work.originalThemeName);

        let description = work.description;
        if (WorkAndBallotTypeHelper.isQuestion(work.type.displayName)) {
            description = QuestionHelper.formatQuestionWithLineBreaks(description);
        }
        response.description = description;
        if (extraInfos && extraInfos.length > 0) {
            response.extraInfos = {};
            for (let i in extraInfos) {
                response.extraInfos[extraInfos[i].info] = extraInfos[i].value;
            }
        }
        if (WorkAndBallotTypeHelper.isCommission(work.type.displayName)) {
            response.title = response.extraInfos['commissionName']
        } else if (WorkAndBallotTypeHelper.isPublicSession(work.type.displayName)) {
            response.title = 'Séance publique'
        }  else if (WorkAndBallotTypeHelper.isProposition(work.type.displayName) && !work.isAuthor) {
            response.type = 'cosigned_law_proposal'
        } else {
            response.title = work.title
        }
        return response;
    },

    prepareBallotResponse: function(ballot) {
        return {
            id: parseInt(ballot.officialId),
            date: DateHelper.formatDateForWS(ballot.date),
            description: ballot.title,
            title: ballot.type.displayName,
            type: ballot.type.name,
            theme: createThemeResponse(ballot.themeId, ballot.originalThemeName),
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

let createThemeResponse = function(theme, originalName) {
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
        theme.shortName = ThemeHelper.findShorterName(originalName);
    }
    return theme;
}

let shouldShowThemeSubName = function(themeName, originalThemeName) {
    let shouldShow = true;
    if (!originalThemeName || originalThemeName.length === 0) {
        shouldShow = false;
    } else if (themeName == originalThemeName) {
        shouldShow = false;
    } else {
        if (themeName.toLowerCase().includes(originalThemeName.toLowerCase()) && (100 * originalThemeName.length / themeName.length >= 50)) {
            shouldShow = false;
        }
    }
    return shouldShow;
}

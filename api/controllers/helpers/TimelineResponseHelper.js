let Promise = require('bluebird');
let ResponseBuilder = require('./ResponseBuilder.js');
let DateHelper = require('../../services/helpers/DateHelper.js');
let ResponseHelper = require('../../services/helpers/ResponseHelper.js');
let QuestionHelper = require('./QuestionHelper.js')

const BASE_URL = 'http://www2.assemblee-nationale.fr/';
const PARAM_DEPUTY_ID = '{deputy_id}';
const PARAM_MANDATE_NUMBER = '15';
const DEPUTY_PHOTO_URL = BASE_URL + 'static/tribun/' + PARAM_MANDATE_NUMBER + '/photos/' + PARAM_DEPUTY_ID + '.jpg'

const WORK_TYPE_VOTE_SOLEMN = 'vote_solemn';
const WORK_TYPE_VOTE_ORDINARY = 'vote_ordinary';
const WORK_TYPE_VOTE_CENSURE = 'vote_motion_of_censure';
const WORK_TYPE_VOTE_OTHER = 'vote_others';
const WORK_TYPE_VOTE_UNDEFINED = 'vote_undefined';
const WORK_TYPE_QUESTIONS = 'question';
const WORK_TYPE_REPORTS = 'report';
const WORK_TYPE_PROPOSITIONS = 'law_proposal';
const WORK_TYPE_COSIGNED_PROPOSITIONS = 'cosigned_law_proposal';
const WORK_TYPE_COMMISSIONS = 'commission';
const WORK_TYPE_PUBLIC_SESSIONS = 'public_session';

const NUMBER_OF_DEPUTIES = 577;

var self = module.exports = {
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
            type: work.type,
            date: DateHelper.formatDateForWS(work.date),
            fileUrl: work.url
        }

        response.theme = ResponseHelper.createThemeResponse(work.themeId, work.originalThemeName);

        let description = work.description;
        if (work.type === WORK_TYPE_QUESTIONS) {
            description = QuestionHelper.formatQuestionWithLineBreaks(description);
        }
        response.description = description;
        if (extraInfos && extraInfos.length > 0) {
            response.extraInfos = {};
            for (let i in extraInfos) {
                response.extraInfos[extraInfos[i].info] = extraInfos[i].value;
            }
        }

        if (work.type === WORK_TYPE_COMMISSIONS) {
            response.title = response.extraInfos['commissionName']
        } else if (work.type === WORK_TYPE_PUBLIC_SESSIONS) {
            response.title = 'Séance publique'
        }  else {
            response.title = work.title
        }
        return response;
    },

    prepareBallotResponse: function(ballot) {
        return {
            id: parseInt(ballot.officialId),
            date: DateHelper.formatDateForWS(ballot.date),
            description: ballot.title,
            title: ResponseHelper.getBallotTypeDisplayName(ballot.type),
            type: ResponseHelper.getBallotTypeName(ballot.type),
            theme: ResponseHelper.createThemeResponse(ballot.themeId, ballot.originalThemeName),
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

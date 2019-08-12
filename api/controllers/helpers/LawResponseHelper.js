let Promise = require('bluebird');
let ResponseBuilder = require('./ResponseBuilder.js');
let DateHelper = require('../../services/helpers/DateHelper.js');
let ResponseHelper = require('../../services/helpers/ResponseHelper.js');
let ThemeResponseHelper = require('./ThemeResponseHelper.js');
let QuestionHelper = require('./QuestionHelper.js')
let ShortThemeHelper = require('./ShortThemeHelper.js')
let WorkAndBallotTypeHelper = require('../../services/helpers/WorkAndBallotTypeHelper.js')

const NUMBER_OF_DEPUTIES = 577;

var self = module.exports = {
    formatLawBallotsResponse: function(lawWithBallots, deputy) {
        return self.createLawResponse(lawWithBallots)
        .then(law => {
            return Promise.map(lawWithBallots.ballots, ballot => {
                return self.createBallotDetailsResponse(ballot, deputy)
            })
            .then(ballots => {
                law.ballots = ballots;
                return law;
            })
        })
    },

    createLawResponse: async function(law) {
        let title = 'Scrutins de ' + law.title.charAt(0).toLowerCase() + law.title.slice(1);
        let response = {
            id: law.id,
            title: title,
            lastBallotDate: DateHelper.formatDateForWS(law.lastBallotDate),
            ballotsCount: law.ballotsCount,
            fileUrl: law.fileUrl,
            theme: await ThemeResponseHelper.createThemeResponse(law.theme, law.originalThemeName)
        }
        return response;
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

    prepareBallotResponse: async function(ballot) {
        return {
            id: parseInt(ballot.officialId),
            date: DateHelper.formatDateForWS(ballot.date),
            description: ballot.title,
            title: ballot.type.displayName,
            type: ballot.type.name,
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

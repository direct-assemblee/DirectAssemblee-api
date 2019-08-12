let Promise = require('bluebird');
let DateHelper = require('../../services/helpers/DateHelper.js');
let ResponseHelper = require('../../services/helpers/ResponseHelper.js');

const NUMBER_OF_DEPUTIES = 577;

var self = module.exports = {
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

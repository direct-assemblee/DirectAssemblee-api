let VoteService = require('../VoteService.js');

module.exports = {
    getDeputyVote: function(deputyId, ballot) {
        return VoteService.findVoteForDeputyAndBallot(deputyId, ballot.officialId)
        .then(vote => {
            ballot.deputyVote = vote ? vote.value : 'missing';
            return ballot;
        })
    }
}

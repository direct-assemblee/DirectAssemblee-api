let Promise = require('bluebird');
let CronJob = require('cron').CronJob;
let DateHelper = require('./helpers/DateHelper.js');

const ACTIVITY_RATE_UPDATE_TIME = '0 30 3 * * *'
const MANDATE_START_DATE = '2017-06-18'

module.exports = {
    startUpdateCron: function() {
        console.log('starting cron for daily activity rates update')
        new CronJob(ACTIVITY_RATE_UPDATE_TIME, function() {
            updateActivityRates()
        }, null, true, 'Europe/Paris');
    },

    getSortedActivityRatesByParliamentGroup: function() {
        return getGroupedActivityRates()
        .then(groupedRates => {
            return groupedRates.sort((a, b) => {
                return b.activityRate - a.activityRate;
            });
        })
    }
}

let getGroupedActivityRates = function() {
    return DeputyService.findGroupedDeputies()
    .then(groupedDeputies => {
        let groupedRates = []
        groupedDeputies.forEach(function(groupAndDeputies, groupId) {
            let deputies = groupAndDeputies.deputies
            let ratesSum = 0
            for (let i in deputies) {
                ratesSum += deputies[i].activityRate
            }
            groupedRates[groupId] = { group: groupAndDeputies.group, activityRate: Math.round(ratesSum / deputies.length)}
        })
        return groupedRates
    })
}

let updateActivityRates = function() {
    console.log('start updating activity rates')
    return updateActivityRate(false)
    .then(function() {
        console.log('done updating activity rates')
    })
}

let updateActivityRate = function(solemnBallotsOnly) {
    return DeputyService.findCurrentDeputies()
    .then(function(currentDeputies) {
        return BallotService.findBallotsFromDate(MANDATE_START_DATE, solemnBallotsOnly)
        .then(function(allBallots) {
            return VoteService.findVotesOrderedByDeputy()
            .then(function(votes) {
                let votesMap = {}
                for (let i in votes) {
                    let vote = votes[i]
                    if (!votesMap[vote.deputyId]) {
                        votesMap[vote.deputyId] = [];
                    }
                    votesMap[vote.deputyId].push(vote.ballotId)
                }
                return Promise.map(currentDeputies, function(deputy) {
                    return findDeputyBallots(deputy, allBallots, solemnBallotsOnly)
                    .then(function(ballots) {
                        return findActivityRate(deputy, ballots, votesMap[deputy.officialId])
                        .then(function(activityRate) {
                            if (activityRate) {
                                return DeputyService.updateDeputyWithRate(deputy.officialId, activityRate);
                            }
                        })
                    })
                }, { concurrency: 5 })
            })
        })
    })
}

let findDeputyBallots = function(deputy, allBallots, solemnBallotsOnly) {
    if (DateHelper.getDiffInDays(deputy.currentMandateStartDate, MANDATE_START_DATE) == 0) {
        return new Promise(function(resolve) {
            resolve(allBallots)
        })
    } else {
        return BallotService.findBallotsFromDate(deputy.currentMandateStartDate, solemnBallotsOnly)
    }
}

let findActivityRate = function(deputy, ballots, votes) {
	if (ballots && ballots.length > 0) {
		return Promise.filter(ballots, function(ballot) {
			return votes && !votes.includes(ballot.officialId);
		})
		.then(function(missingBallots) {
			let rate = missingBallots.length * 100 / ballots.length;
            let reverse = 100 - rate
			return Math.round(reverse * 100) / 100;
		})
	} else {
        return new Promise(function(resolve) {
            resolve(-1);
        })
    }
}

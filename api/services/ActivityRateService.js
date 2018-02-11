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
            return Promise.map(currentDeputies, function(deputy) {
                return findDeputyBallots(deputy, allBallots, solemnBallotsOnly)
                .then(function(ballots) {
                    return findActivityRate(deputy, ballots)
                    .then(function(activityRate) {
                        return DeputyService.updateDeputyWithRate(deputy.officialId, activityRate);
                    })
                })
            }, { concurrency: 1 })
        })
    })
}

let findDeputyBallots = function(deputy, allBallots, solemnBallotsOnly) {
    if (DateHelper.getDiffInDays(deputy.currentMandateStartDate, MANDATE_START_DATE) == 0) {
        return new Promise(function(resolve) {
            resolve(allBallots)
        })
    } else {
        return BallotService.findBallotsFromDate(MANDATE_START_DATE, solemnBallotsOnly)
    }
}

let findActivityRate = function(deputy, ballots) {
	if (ballots && ballots.length > 0) {
		return VoteService.findVotesBallotIds(deputy.officialId)
		.then(function(votesBallotsIds) {
			return Promise.filter(ballots, function(ballot) {
				return !votesBallotsIds.includes(ballot.officialId);
			})
		})
		.then(function(missingBallots) {
			return WorkService.findWorksDatesForDeputyAfterDate(deputy.officialId, deputy.currentMandateStartDate)
			.then(function(worksDates) {
				return Promise.filter(missingBallots, function(missingBallot) {
					return !worksDates.includes(DateHelper.formatSimpleDate(missingBallot.date));
				})
				.then(function(definitelyMissing) {
					let rate = definitelyMissing.length * 100 / ballots.length;
                    let reverse = 100 - rate
					return Math.round(reverse * 100) / 100;
				})
			})
		})
	}
}

let DateHelper = require('./helpers/DateHelper.js');
let BallotService = require('./BallotService.js');
let WorkService = require('./WorkService.js');
let Promise = require('bluebird');

const TIMELINE_PAGE_ITEMS_COUNT = 20;
const TIMELINE_MONTHS_INCREMENT_STEP = 1;

module.exports = {
    getTimeline: function(deputy, offset) {
        let mandateStartDate = DateHelper.formatDate(deputy.currentMandateStartDate)
        let beforeDate = DateHelper.getFormattedNow();
        let afterDate = DateHelper.getDateForMonthsBack(TIMELINE_MONTHS_INCREMENT_STEP);
        let itemsOffset = offset * TIMELINE_PAGE_ITEMS_COUNT;
        return getDeputyTimeline(deputy, mandateStartDate, afterDate, beforeDate, itemsOffset, []);
    }
}

let getDeputyTimeline = function(deputy, mandateStartDate, afterDate, beforeDate, itemsOffset, timelineItems) {
    return findTimelineItems(deputy, afterDate, beforeDate)
    .then(function(foundItems) {
        if (foundItems.length == 0 && afterDate < mandateStartDate) {
            return timelineItems;
        }
        let offset = itemsOffset - foundItems.length;
        if (offset > 0) {
            return nextDeputyTimeline(deputy, mandateStartDate, beforeDate, afterDate, offset, timelineItems);
        }

        let sortedItems = sortItemsWithDateAndOfficialId(foundItems);
        let newOffset = itemsOffset;
        for (let i = itemsOffset ; i < sortedItems.length && timelineItems && timelineItems.length < TIMELINE_PAGE_ITEMS_COUNT ; i++) {
            if (sortedItems[i]) {
                timelineItems.push(sortedItems[i]);
            }
            newOffset = 0;
        }
        if (timelineItems.length == TIMELINE_PAGE_ITEMS_COUNT) {
            return timelineItems;
        } else {
            return nextDeputyTimeline(deputy, mandateStartDate, beforeDate, afterDate, newOffset, timelineItems);
        }
    });
}

let sortItemsWithDateAndOfficialId = function(items) {
    items.sort(function(a, b) {
        var diff = DateHelper.getDiffInDays(a.date, b.date);
        var result = diff == 0 ? 0 : diff > 0 ? 1 : -1;
        if (result === 0 && a.deputyVote && b.deputyVote) {
            result = parseInt(a.officialId) < parseInt(b.officialId) ? 1 : -1;
        }
        return result
    });
    return items;
}

let findTimelineItems = function(deputy, afterDate, beforeDate) {
    return BallotService.findBallotsBetweenDates(beforeDate, afterDate)
    .then(function(ballots) {
        return Promise.map(ballots, function(ballot) {
            return retrieveVoteExtra(ballot, deputy);
        }, {concurrency: 10})
        .then(function(results) {
            return WorkService.findWorksForDeputyBetweenDates(deputy.officialId, afterDate, beforeDate)
            .then(function(works) {
                return results.concat(works)
            })
        });
    })
}

let nextDeputyTimeline = function(deputy, mandateStartDate, beforeDate, afterDate, itemsOffset, timelineItems) {
    let newBeforeDate = DateHelper.substractAndFormat(beforeDate, TIMELINE_MONTHS_INCREMENT_STEP, 'months');
    let newAfterDate = DateHelper.substractAndFormat(afterDate, TIMELINE_MONTHS_INCREMENT_STEP, 'months');
    return getDeputyTimeline(deputy, mandateStartDate, newAfterDate, newBeforeDate, itemsOffset, timelineItems);
}

// let retrieveVoteExtraForDistrict = function(ballot, departmentId, district) {
//     return DeputyService.findMostRecentDeputyAtDate(departmentId, district, ballot.date)
//     .then(function(deputy) {
//         return retrieveVoteExtra(ballot, deputy);
//     })
// }

let retrieveVoteExtra = function(ballot, deputy) {
    if (deputy) {
        return VoteService.findVoteForDeputyAndBallot(deputy.officialId, ballot.officialId)
        .then(function(vote) {
            ballot.deputyVote = vote ? vote.value : 'missing';
            return ballot;
        })
    } else {
        return ballot;
    }
}

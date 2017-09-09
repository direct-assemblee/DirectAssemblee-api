let DateHelper = require('./helpers/DateHelper.js');
let ResponseHelper = require('./helpers/ResponseHelper.js');

const TIMELINE_PAGE_ITEMS_COUNT = 20;
const TIMELINE_MONTHS_INCREMENT_STEP = 4;

module.exports = {
    getTimeline: function(deputy, offset) {
        let mandateStartDate = DateHelper.formatDate(deputy.currentMandateStartDate)
        let beforeDate = DateHelper.formattedNow();
        let afterDate = DateHelper.getDateForMonthsBack(TIMELINE_MONTHS_INCREMENT_STEP);
        let itemsOffset = offset * TIMELINE_PAGE_ITEMS_COUNT;
        return getDeputyTimeline(deputy.officialId, mandateStartDate, beforeDate, afterDate, itemsOffset, []);
    }
}

let getDeputyTimeline = function(deputyId, mandateStartDate, beforeDate, afterDate, itemsOffset, timelineItems) {
    return findTimelineItems(deputyId, beforeDate, afterDate)
    .then(function(foundItems) {
        if (foundItems.length == 0 && afterDate < mandateStartDate) {
            return timelineItems;
        }
        let offset = itemsOffset - foundItems.length;
        if (offset > 0) {
            return nextDeputyTimeline(deputyId, mandateStartDate, beforeDate, afterDate, offset, timelineItems);
        }

        let sortedItems = DateHelper.sortItemsWithDate(foundItems);
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
            return nextDeputyTimeline(deputyId, mandateStartDate, beforeDate, afterDate, newOffset, timelineItems);
        }
    })
}

let findTimelineItems = function(deputyId, beforeDate, afterDate) {
    return BallotService.findBallotsBetweenDates(beforeDate, afterDate)
    .then(function(ballots) {
        let promises = [];
        for (let i in ballots) {
            promises.push(VoteService.findVoteValueForDeputyAndBallot(deputyId, ballots[i].id, ballots[i].type))
        }
        return Promise.all(promises)
        .then(function(votesValues) {
            let extendedVotes = [];
            for (let i in votesValues) {
                extendedVotes.push(ResponseHelper.createExtendedVoteForTimeline(ballots[i], votesValues[i]))
            }
            return extendedVotes;
        })
        .then(function(extendedVotes) {
            return WorkService.findWorksForDeputyFromDate(deputyId, beforeDate, afterDate)
            .then(function(works) {
                return extendedVotes.concat(works)
            })
        })
    })
}

let nextDeputyTimeline = function(deputyId, mandateStartDate, beforeDate, afterDate, itemsOffset, timelineItems) {
    let newBeforeDate = DateHelper.substractAndFormat(beforeDate, TIMELINE_MONTHS_INCREMENT_STEP, 'months');
    let newAfterDate = DateHelper.substractAndFormat(afterDate, TIMELINE_MONTHS_INCREMENT_STEP, 'months');
    return getDeputyTimeline(deputyId, mandateStartDate, newBeforeDate, newAfterDate, itemsOffset, timelineItems);
}

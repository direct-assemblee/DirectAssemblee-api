let DateHelper = require('./helpers/DateHelper.js');

const TIMELINE_PAGE_ITEMS_COUNT = 20;
const TIMELINE_MONTHS_INCREMENT_STEP = 4;

module.exports = {
    getTimeline: function(deputy, offset) {
        let mandateStartDate = DateHelper.formatDate(deputy.currentMandateStartDate)
        let beforeDate = DateHelper.getFormattedNow();
        let afterDate = DateHelper.getDateForMonthsBack(TIMELINE_MONTHS_INCREMENT_STEP);
        let itemsOffset = offset * TIMELINE_PAGE_ITEMS_COUNT;
        return getDeputyTimeline(deputy, mandateStartDate, beforeDate, afterDate, itemsOffset, []);
    }
}

let getDeputyTimeline = function(deputy, mandateStartDate, beforeDate, afterDate, itemsOffset, timelineItems) {
    return findTimelineItems(deputy, beforeDate, afterDate)
    .then(function(foundItems) {
        if (foundItems.length == 0 && afterDate < mandateStartDate) {
            return timelineItems;
        }
        let offset = itemsOffset - foundItems.length;
        if (offset > 0) {
            return nextDeputyTimeline(deputy, mandateStartDate, beforeDate, afterDate, offset, timelineItems);
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
            return nextDeputyTimeline(deputy, mandateStartDate, beforeDate, afterDate, newOffset, timelineItems);
        }
    })
}

let findTimelineItems = function(deputy, beforeDate, afterDate) {
    return BallotService.getDetailedBallotsBetweenDates(deputy, beforeDate, afterDate)
    .then(function(results) {
        return WorkService.findWorksForDeputyFromDate(deputy.officialId, beforeDate, afterDate)
        .then(function(works) {
            return results.concat(works)
        })
    })
}

let nextDeputyTimeline = function(deputy, mandateStartDate, beforeDate, afterDate, itemsOffset, timelineItems) {
    let newBeforeDate = DateHelper.substractAndFormat(beforeDate, TIMELINE_MONTHS_INCREMENT_STEP, 'months');
    let newAfterDate = DateHelper.substractAndFormat(afterDate, TIMELINE_MONTHS_INCREMENT_STEP, 'months');
    return getDeputyTimeline(deputy, mandateStartDate, newBeforeDate, newAfterDate, itemsOffset, timelineItems);
}

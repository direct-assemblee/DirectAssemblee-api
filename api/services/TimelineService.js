let DateHelper = require('./helpers/DateHelper.js');
let WorkAndBallotTypeHelper = require('./helpers/WorkAndBallotTypeHelper.js');
let BallotService = require('./BallotService.js');
let WorkService = require('./WorkService.js');
let Constants = require('./Constants.js');
let Promise = require('bluebird');

const NUMBER_OF_MONTHS = 1;
const TIMELINE_PAGE_ITEMS_MIN_COUNT = 20;

module.exports = {
    getTimeline: function(deputy, offset) {
        let beforeDate = DateHelper.getFormattedNow();
        let afterDate = DateHelper.getDayBeforeAPreviousMonth(NUMBER_OF_MONTHS - 1, beforeDate)
        return getTimelineForMonth(deputy, deputy.currentMandateStartDate, afterDate, beforeDate)
    }
}

let getTimelineForMonth = async function(deputy, mandateStartDate, afterDate, beforeDate) {
    let reachedMandateStartDate = false;
    if (mandateStartDate > afterDate) {
        afterDate = mandateStartDate
    }

    var foundItems = [];
    do {
        console.log(beforeDate + ' => ' + afterDate)

        var items = await findTimelineItems(deputy, afterDate, beforeDate)
        if (items.length == 0 && afterDate < mandateStartDate) {
            return;
        }

        var validItems = items.filter(item => item != null);
        foundItems = foundItems.concat(sortItemsWithDate(validItems))

        let needEvenMore = foundItems.length < TIMELINE_PAGE_ITEMS_MIN_COUNT;
        if (needEvenMore && !reachedMandateStartDate) {
            beforeDate = afterDate;
            afterDate = DateHelper.getDayBeforeAPreviousMonth(0, beforeDate)
        }
    } while(foundItems.length < TIMELINE_PAGE_ITEMS_MIN_COUNT && !reachedMandateStartDate);

    return handleTimelineResults(deputy, foundItems);
}

let handleTimelineResults = function(deputy, timelineItems) {
    return Promise.map(timelineItems, timelineItem => {
        if (WorkAndBallotTypeHelper.workHasExtra(timelineItem.type)) {
            return ExtraInfoService.findExtraInfosForWork(timelineItem.id)
            .then(extraInfos => {
                timelineItem.extraInfos = extraInfos;
                return timelineItem;
            })
        } else {
            return timelineItem;
        }
    })
}

let sortItemsWithDate = function(items) {
    items.sort(function(a, b) {
        var diff = DateHelper.getDiffInDays(getTimelineItemDate(a), getTimelineItemDate(b));
        var result = diff === 0 ? 0 : diff > 0 ? 1 : -1;
        if (result === 0) {
            let diff = DateHelper.getDiffInSeconds(a.createdAt, b.createdAt)
            result = diff === 0 ? 0 : diff > 0 ? 1 : -1
        }
        return result
    });
    return items;
}

let getTimelineItemDate = function(timelineItem) {
    return timelineItem.date ? timelineItem.date : timelineItem.lastBallotDate;
}

let findTimelineItems = function(deputy, afterDate, beforeDate) {
    return LawService.findLawsAndBallotsCountBetweenDates(beforeDate, afterDate)
    .then(results => {
        // return BallotService.findUncategorizedBallotsBetweenDates(beforeDate, afterDate)
        // .then(ballots => {
            return WorkService.findWorksForDeputyBetweenDates(deputy.officialId, afterDate, beforeDate)
            // .then(works => results.concat(ballots).concat(works))
            .then(works => results.concat(works))
        // })
    })
}

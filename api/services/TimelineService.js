let DateHelper = require('./helpers/DateHelper.js');
let WorkAndBallotTypeHelper = require('./helpers/WorkAndBallotTypeHelper.js');
let BallotHelper = require('./helpers/BallotHelper.js');
let BallotService = require('./BallotService.js');
let WorkService = require('./WorkService.js');
let Constants = require('./Constants.js');
let Promise = require('bluebird');

const TIMELINE_PAGE_ITEMS_COUNT = 20;
const TIMELINE_MONTHS_INCREMENT_STEP = 1;

module.exports = {
    getTimeline: function(deputy, offset) {
        let beforeDate = DateHelper.getFormattedNow();
        let afterDate = DateHelper.getDateForMonthsBack(TIMELINE_MONTHS_INCREMENT_STEP);
        let itemsOffset = offset * TIMELINE_PAGE_ITEMS_COUNT;
        return getDeputyTimeline(deputy, deputy.currentMandateStartDate, afterDate, beforeDate, itemsOffset)
    }
}

let getDeputyTimeline = async function(deputy, mandateStartDate, afterDate, beforeDate, requestedOffset) {
    let offset = requestedOffset;
    let reachedMandateStartDate = false;
    if (mandateStartDate > afterDate) {
        afterDate = mandateStartDate
    }

    var foundItems = [];
    do {
        var items = await findTimelineItems(deputy, afterDate, beforeDate)
        if (items.length == 0 && afterDate < mandateStartDate) {
            break;
        }

        var validItems = getValidItems(items);

        let tmpOffset = offset - validItems.length;
        let skipTheseItems = tmpOffset >= 0;
        let needEvenMore = validItems.length - offset + foundItems.length < TIMELINE_PAGE_ITEMS_COUNT;
        reachedMandateStartDate = mandateStartDate === afterDate;

        if ((skipTheseItems || needEvenMore) && !reachedMandateStartDate) {
            beforeDate = DateHelper.subtractAndFormat(beforeDate, TIMELINE_MONTHS_INCREMENT_STEP, 'months');
            afterDate = DateHelper.subtractAndFormat(afterDate, TIMELINE_MONTHS_INCREMENT_STEP, 'months');
        }

        if (!skipTheseItems) {
            let sortedItems = sortItemsWithDate(validItems)
            for (let i = offset ; i < sortedItems.length ; i++) {
                foundItems.push(sortedItems[i])
            }
        }

        offset = skipTheseItems ? tmpOffset : needEvenMore ? 0 : offset;
    } while(foundItems.length < TIMELINE_PAGE_ITEMS_COUNT && !reachedMandateStartDate);

    return handlePageItems(deputy, foundItems);
}

let handlePageItems = function(deputy, validItems) {
    let results = []
    for (let i = 0 ; i < validItems.length && results.length < TIMELINE_PAGE_ITEMS_COUNT ; i++) {
        results.push(validItems[i]);
    }
    return handleTimelineResults(deputy, results)
}

let getValidItems = function(items) {
    let validItems = [];
    for (let i in items) {
        if (items[i]) {
            validItems.push(items[i])
        }
    }
    return validItems;
}

let handleTimelineResults = function(deputy, timelineItems) {
    return Promise.map(timelineItems, function(timelineItem) {
        if (WorkAndBallotTypeHelper.workHasExtra(timelineItem.type)) {
            return ExtraInfoService.findExtraInfosForWork(timelineItem.id)
            .then(function(extraInfos) {
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
    return LawService.findLawsCountBetweenDates(beforeDate, afterDate)
    .then(results => {
        return BallotService.findUncategorizedBallotsBetweenDates(beforeDate, afterDate)
        .then(ballots => {
            if (ballots != null && ballots.length > 0) {
                return Promise.map(ballots, ballot => {
                    return BallotHelper.getDeputyVote(deputy.officialId, ballot)
                })
                .then(ballotsWithVotes => {
                    results.push(createGroupedBallots(ballotsWithVotes))
                    return results
                })
            }
            return WorkService.findWorksForDeputyBetweenDates(deputy.officialId, afterDate, beforeDate)
            .then(works => results.concat(works))
        })
    })
}

let createGroupedBallots = function(ballots) {
    let title = ' - type non déterminé'
    var lastBallotDate;
    ballots.forEach(ballot => {
        if (lastBallotDate == null || DateHelper.isLaterOrSame(lastBallotDate, ballot.date)) {
            lastBallotDate = ballot.date;
        }
    })
    return {
        title: title,
        lastBallotDate: DateHelper.formatDateForWS(lastBallotDate),
        ballotsCount: ballots.length,
        ballots: ballots
    }
}

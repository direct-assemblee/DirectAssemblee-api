let DateHelper = require('./helpers/DateHelper.js');
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
            let sortedItems = sortItemsWithDateAndOfficialId(validItems)
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
        if (timelineItem.totalVotes) {
            return retrieveVoteExtra(timelineItem, deputy);
        } else {
            if (timelineItem.type === Constants.WORK_TYPE_PROPOSITIONS || timelineItem.type === Constants.WORK_TYPE_COSIGNED_PROPOSITIONS || timelineItem.type === Constants.WORK_TYPE_COMMISSIONS) {
                return ExtraInfoService.findExtraInfosForWork(timelineItem.id)
                .then(function(extraInfos) {
                    timelineItem.extraInfos = extraInfos;
                    return timelineItem;
                })
            } else {
                return timelineItem;
            }
        }
    })
}

let sortItemsWithDateAndOfficialId = function(items) {
    items.sort(function(a, b) {
        var diff = DateHelper.getDiffInDays(a.date, b.date);
        var result = diff === 0 ? 0 : diff > 0 ? 1 : -1;
        if (result === 0 && a.officialId && b.officialId) {
            result = parseInt(a.officialId) < parseInt(b.officialId) ? 1 : -1;
        } else if (result === 0) {
            let diff = DateHelper.getDiffInSeconds(a.createdAt, b.createdAt)
            result = diff === 0 ? 0 : diff > 0 ? 1 : -1
        }
        return result
    });
    return items;
}

let findTimelineItems = function(deputy, afterDate, beforeDate) {
    return BallotService.findBallotsBetweenDates(beforeDate, afterDate)
    .then(function(results) {
        return WorkService.findWorksForDeputyBetweenDates(deputy.officialId, afterDate, beforeDate)
        .then(function(works) {
            return results.concat(works)
        })
    })
}

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

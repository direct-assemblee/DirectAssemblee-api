let DateHelper = require('./helpers/DateHelper.js');
let BallotService = require('./BallotService.js');
let WorkService = require('./WorkService.js');
let Promise = require('bluebird');

const TIMELINE_PAGE_ITEMS_COUNT = 20;
const TIMELINE_MONTHS_INCREMENT_STEP = 1;

module.exports = {
    getTimeline: function(deputy, offset) {
        let beforeDate = DateHelper.getFormattedNow();
        let afterDate = DateHelper.getDateForMonthsBack(TIMELINE_MONTHS_INCREMENT_STEP);
        let itemsOffset = offset * TIMELINE_PAGE_ITEMS_COUNT;
        console.time('getTimeline for ' + deputy.officialId + ' - offset ' + offset);
        return getDeputyTimeline(deputy, deputy.currentMandateStartDate, afterDate, beforeDate, itemsOffset, [])
        .then(function(timeline) {
            console.timeEnd('getTimeline for ' + deputy.officialId + ' - offset ' + offset);
            return timeline
        })
    }
}

let getDeputyTimeline = function(deputy, mandateStartDate, afterDate, beforeDate, itemsOffset, timelineItems) {
    console.time('  findTimelineItems for ' + deputy.officialId + ' - afterDate ' + afterDate);
    return findTimelineItems(deputy, afterDate, beforeDate)
    .then(function(foundItems) {
        if (foundItems.length == 0 && afterDate < mandateStartDate) {
            return timelineItems;
        }
        let offset = itemsOffset - foundItems.length;
        if (offset > 0) {
            return nextDeputyTimeline(deputy, mandateStartDate, beforeDate, afterDate, offset, timelineItems)
            .then(function(items) {
                console.timeEnd('  findTimelineItems for ' + deputy.officialId + ' - afterDate ' + afterDate);
                return items
            })
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
            return Promise.map(timelineItems, function(timelineItem) {
                if (timelineItem.totalVotes) {
                    console.log('      retrieveVoteExtra ' + timelineItem.officialId)
                    return retrieveVoteExtra(timelineItem, deputy);
                } else {
                    console.log('      findExtraInfosForWork ' + timelineItem.id)
                    if (timelineItem.type === Constants.WORK_TYPE_PROPOSITIONS || timelineItem.type === Constants.WORK_TYPE_COSIGNED_PROPOSITIONS || timelineItem.type === Constants.WORK_TYPE_COMMISSION) {
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
            .then(function(items) {
                console.timeEnd('  findTimelineItems for ' + deputy.officialId + ' - afterDate ' + afterDate);
                return items;
            })
        } else {
            return nextDeputyTimeline(deputy, mandateStartDate, beforeDate, afterDate, newOffset, timelineItems)
            .then(function(items) {
                console.timeEnd('  findTimelineItems for ' + deputy.officialId + ' - afterDate ' + afterDate);
                return items;
            })
        }
    });
}

let sortItemsWithDateAndOfficialId = function(items) {
    items.sort(function(a, b) {
        var diff = DateHelper.getDiffInDays(a.date, b.date);
        var result = diff == 0 ? 0 : diff > 0 ? 1 : -1;
        if (result === 0 && a.officialId && b.officialId) {
            result = parseInt(a.officialId) < parseInt(b.officialId) ? 1 : -1;
        }
        return result
    });
    return items;
}

let findTimelineItems = function(deputy, afterDate, beforeDate) {
    console.time('    findBallotsBetweenDates for ' + deputy.officialId + ' - afterDate ' + afterDate);
    return BallotService.findBallotsBetweenDates(beforeDate, afterDate)
    .then(function(results) {
        console.timeEnd('    findBallotsBetweenDates for ' + deputy.officialId + ' - afterDate ' + afterDate);
        console.time('    findWorksForDeputy ' + deputy.officialId + ' - afterDate ' + afterDate);
        return WorkService.findWorksForDeputyBetweenDates(deputy.officialId, afterDate, beforeDate)
        .then(function(works) {
            console.timeEnd('    findWorksForDeputy ' + deputy.officialId + ' - afterDate ' + afterDate);
            return results.concat(works)
        })
    })
}

let nextDeputyTimeline = function(deputy, mandateStartDate, beforeDate, afterDate, itemsOffset, timelineItems) {
    let newBeforeDate = DateHelper.subtractAndFormat(beforeDate, TIMELINE_MONTHS_INCREMENT_STEP, 'months');
    let newAfterDate = DateHelper.subtractAndFormat(afterDate, TIMELINE_MONTHS_INCREMENT_STEP, 'months');
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
        console.time('      retrieveVoteExtra for ' + deputy.officialId + ' - ballot ' + ballot.officialId);
        return VoteService.findVoteForDeputyAndBallot(deputy.officialId, ballot.officialId)
        .then(function(vote) {
            console.timeEnd('      retrieveVoteExtra for ' + deputy.officialId + ' - ballot ' + ballot.officialId);
            ballot.deputyVote = vote ? vote.value : 'missing';
            return ballot;
        })
    } else {
        return ballot;
    }
}

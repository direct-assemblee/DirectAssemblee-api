var DateHelper = require('./helpers/DateHelper.js');
var ResponseHelper = require('./helpers/ResponseHelper.js');

const TIMELINE_PAGE_ITEMS_COUNT = 20;
const TIMELINE_MONTHS_INCREMENT_STEP = 4;

module.exports = {
  getTimeline: function(deputy, offset) {
    var mandateStartDate = DateHelper.formatDate(deputy.currentMandateStartDate)
    var beforeDate = DateHelper.formattedNow();
    var afterDate = DateHelper.getDateForMonthsBack(TIMELINE_MONTHS_INCREMENT_STEP);
    var itemsOffset = offset * TIMELINE_PAGE_ITEMS_COUNT;
    return getDeputyTimeline(deputy.id, mandateStartDate, beforeDate, afterDate, itemsOffset, []);
  }
}

var getDeputyTimeline = function(deputyId, mandateStartDate, beforeDate, afterDate, itemsOffset, timelineItems) {
	return findTimelineItems(deputyId, beforeDate, afterDate)
	.then(function(foundItems) {
		if (foundItems.length == 0 && afterDate < mandateStartDate) {
			return timelineItems;
		}
		var offset = itemsOffset - foundItems.length;
		if (offset > 0) {
			return nextDeputyTimeline(deputyId, mandateStartDate, beforeDate, afterDate, offset, timelineItems);
		}

		var sortedItems = sortTimelineItems(foundItems);
		var count = 0;
		for (var i = itemsOffset ; i < sortedItems.length && timelineItems && timelineItems.length < TIMELINE_PAGE_ITEMS_COUNT ; i++) {
			count++;
			if (sortedItems[i]) {
				timelineItems.push(sortedItems[i]);
			}
		}
		 if (timelineItems.length == TIMELINE_PAGE_ITEMS_COUNT) {
			return timelineItems;
		} else {
			return nextDeputyTimeline(deputyId, mandateStartDate, beforeDate, afterDate, itemsOffset - count, timelineItems);
		}
  })
}

var findTimelineItems = function(deputyId, beforeDate, afterDate) {
  return BallotService.findBallotsBetweenDates(beforeDate, afterDate)
  .then(function(ballots) {
    var promises = [];
    for (i in ballots) {
      promises.push(VoteService.findVoteValueForDeputyAndBallot(deputyId, ballots[i].id))
    }
    return Promise.all(promises)
    .then(function(votesValues) {
      var extendedVotes = [];
      for (i in votesValues) {
        extendedVotes.push(ResponseHelper.createExtendedVoteForTimeline(ballots[i], votesValues[i]))
      }
      return extendedVotes;
    })
    .then(function(extendedVotes) {
  		return WorkService.findWorksForDeputyFromDate(deputyId, beforeDate, afterDate)
  	})
  })
}

var nextDeputyTimeline = function(deputyId, mandateStartDate, beforeDate, afterDate, itemsOffset, timelineItems) {
	var newBeforeDate = DateHelper.substractMonthsAndFormat(beforeDate, TIMELINE_MONTHS_INCREMENT_STEP);
	var newAfterDate = DateHelper.substractMonthsAndFormat(afterDate, TIMELINE_MONTHS_INCREMENT_STEP);
	return getDeputyTimeline(deputyId, mandateStartDate, newBeforeDate, newAfterDate, itemsOffset, timelineItems);
}

var sortTimelineItems = function(items) {
	items.sort(function(a, b) {
		return new Date(b.date).getTime() - new Date(a.date).getTime()
	});
	return items;
}

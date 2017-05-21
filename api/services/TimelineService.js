var DateHelper = require('./helpers/DateHelper.js');
var ResponseHelper = require('./helpers/ResponseHelper.js');

const TIMELINE_PAGE_ITEMS_COUNT = 20;
const TIMELINE_MONTHS_INCREMENT_STEP = 4;

module.exports = {
  getTimeline: function(deputy, offset) {
    var mandateStartDate = DateHelper.formatDate(deputy.currentMandateStartDate)
    var minDate = DateHelper.formattedNow();
    var maxDate = DateHelper.getDateForMonthsBack(TIMELINE_MONTHS_INCREMENT_STEP);
    var itemsOffset = offset * TIMELINE_PAGE_ITEMS_COUNT;
    return getDeputyTimeline(deputy.id, mandateStartDate, minDate, maxDate, itemsOffset, []);
  },

  findLastItems:function(deputyId, maxDate) {
    return findTimelineItems(deputyId, DateHelper.formattedNow(), maxDate);
  }
}

var getDeputyTimeline = function(deputyId, mandateStartDate, minDate, maxDate, itemsOffset, timelineItems) {
	return findTimelineItems(deputyId, minDate, maxDate)
	.then(function(foundItems) {
		if (foundItems.length == 0 && maxDate < mandateStartDate) {
			return timelineItems;
		}
		var offset = itemsOffset - foundItems.length;
		if (offset > 0) {
			return nextDeputyTimeline(deputyId, mandateStartDate, minDate, maxDate, offset, timelineItems);
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
			return nextDeputyTimeline(deputyId, mandateStartDate, minDate, maxDate, itemsOffset - count, timelineItems);
		}
  })
}

var findTimelineItems = function(deputyId, minDate, maxDate) {
  return BallotService.findBallotsBetweenDates(minDate, maxDate)
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
  		return WorkService.findWorksForDeputyFromDate(deputyId, minDate, maxDate)
  	})
  })
}

var nextDeputyTimeline = function(deputyId, mandateStartDate, minDate, maxDate, itemsOffset, timelineItems) {
	var newMinDate = DateHelper.substractMonthsAndFormat(minDate, TIMELINE_MONTHS_INCREMENT_STEP);
	var newMaxDate = DateHelper.substractMonthsAndFormat(maxDate, TIMELINE_MONTHS_INCREMENT_STEP);
	return getDeputyTimeline(deputyId, mandateStartDate, newMinDate, newMaxDate, itemsOffset, timelineItems);
}

var sortTimelineItems = function(items) {
	items.sort(function(a, b) {
		return new Date(b.date).getTime() - new Date(a.date).getTime()
	});
	return items;
}

var DateHelper = require('./helpers/DateHelper.js');
var MathHelper = require('./helpers/MathHelper.js');

const PARAM_DEPUTY_ID = "{deputy_id}";
const MANDATE_NUMBER = "14";
const BASE_URL = "http://www2.assemblee-nationale.fr/";
const DEPUTY_PHOTO_URL = BASE_URL + "static/tribun/" + MANDATE_NUMBER + "/photos/" + PARAM_DEPUTY_ID + ".jpg"

const TIMELINE_PAGE_ITEMS_COUNT = 20;
const TIMELINE_MONTHS_INCREMENT_STEP = 4;

var self = module.exports = {
	getDeputyWithId: function(deputyId) {
		return Deputy.findOne().where({
			id: deputyId
		})
		.then(function(deputy) {
			deputy.photoUrl = DEPUTY_PHOTO_URL.replace(PARAM_DEPUTY_ID, deputy.officialId)
			var clearedDeputy = removeUnwantedFields(deputy);
			return MandateService.getPoliticalAgeOfDeputy(clearedDeputy.id)
			.then(function(parliamentAgeInYears) {
				clearedDeputy.parliamentAgeInYears = parliamentAgeInYears;
				return clearedDeputy;
			})
		})
		.then(function(deputy) {
			return DeclarationService.getDeclarationsForDeputy(deputy.id)
			.then(function(declarations) {
				deputy.declarations = declarations;
				return deputy;
			})
		})
		.then(function(deputy) {
			return findMissingRate(deputy, false)
			.then(function(missingRate) {
				deputy.missingRate = missingRate;
				return deputy;
			})
		})
	},

	getDeputyTimelineForPage: function(deputyId, offset) {
		return self.getDeputyWithId(deputyId)
		.then(function(deputy) {
			var mandateStartDate = deputy.currentMandateStartDate;
			mandateStartDate = DateHelper.formatDate(mandateStartDate)
			var minDate = DateHelper.formattedNow();
			var maxDate = DateHelper.getDateForMonthsBack(TIMELINE_MONTHS_INCREMENT_STEP);
			var itemsOffset = offset * TIMELINE_PAGE_ITEMS_COUNT;
			return getDeputyTimeline(deputyId, mandateStartDate, minDate, maxDate, itemsOffset, []);
		})
	}
};

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

var findTimelineItems = function(deputyId, minDate, maxDate) {
	return VoteService.findVotesFromDate(deputyId, minDate, maxDate)
	.then(function(extendedVotes) {
		return WorkService.findWorksForDeputyFromDate(deputyId, minDate, maxDate)
		.then(function(works) {
			return works.concat(extendedVotes);
		})
	})
}

var removeUnwantedFields = function(deputy) {
	delete deputy.officialId;
	delete deputy.gender;
	delete deputy.createdAt;
	delete deputy.updatedAt;
	return deputy;
}

var findMissingRate = function(deputy, solemnBallotsOnly) {
	return BallotService.findBallotsIdFromDate(deputy.currentMandateStartDate, solemnBallotsOnly)
	.then(function(ballots) {
		return VoteService.findVotes(deputy.id, solemnBallotsOnly)
		.then(function(votes) {
			var rate = 100 - (votes.length * 100 / ballots.length);
			return MathHelper.roundToTwoDecimals(rate);
		})
	})
}

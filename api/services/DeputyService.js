var DateHelper = require('./helpers/DateHelper.js');

const PARAM_DEPUTY_ID = "{deputy_id}";
const MANDATE_NUMBER = "14";
const BASE_URL = "http://www2.assemblee-nationale.fr/";
const DEPUTY_PHOTO_URL = BASE_URL + "static/tribun/" + MANDATE_NUMBER + "/photos/" + PARAM_DEPUTY_ID + ".jpg"

self = module.exports = {
	getDeputyWithId: function(id) {
		return Deputy.findOne().where({
			id: id
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
			return findMissingRate(deputy)
			.then(function(missingRate) {
				deputy.missingRate = missingRate;
				return deputy;
			})
		})
	},
};

var removeUnwantedFields = function(deputy) {
	delete deputy.officialId;
	delete deputy.gender;
	delete deputy.createdAt;
	delete deputy.updatedAt;
	return deputy;
}

var findMissingRate = function(deputy) {
	var deputyStartDate = DateHelper.formatDate("21/01/2014");
	return BallotService.getBallotsIdFromDate(deputyStartDate)
	.then(function(ballots) {
		return VoteService.findAllVotes(deputy.id)
		.then(function(votes) {
			return votes.length * 100 / ballots.length;
		})
	})
}

	// getDeputeInfosWithId: function(id) {
	// 	return self.getDeputeWithId(id)
	// 	.then(function(depute) {
	// 		console.log(depute)
	// 		if (depute) {
	// 			return DeputeInfos.findOne().where({
	// 				officialId: depute.officialId
	// 			}).then(function(deputeInfos) {
	// 				var birthdate = moment(deputeInfos.birthdate).format("DD/MM/YYYY");
	// 				var mandateStartingDate = moment(deputeInfos.mandateStartingDate).format("DD/MM/YYYY");
	// 	    	var photoUrl = DEPUTE_PHOTO_URL.replace(PARAM_DEPUTY_ID, deputeInfos.officialId)
	// 				return {
	// 					'id': id,
	// 					'firstname': deputeInfos.firstname,
	// 					'lastname': deputeInfos.lastname,
	// 					'location': {
	// 						'department': {
	// 							'number' : deputeInfos.departmentNumber,
	// 							'name' : ""
	// 						},
	// 						'circonscription': {
	// 							'number' : deputeInfos.circonscriptionNumber,
	// 							'name' : deputeInfos.circonscriptionName,
	// 						}
	// 					},
	// 					'party': {
	// 						'name': deputeInfos.party,
	// 						'nameShort': deputeInfos.partyShort,
	// 						'role': deputeInfos.roleInParty
	// 					},
	// 					'photoUrl': photoUrl,
	// 					'numberOfMandates': deputeInfos.numberOfMandates
	//
	// 					// 'birthdate': birthdate,
	// 					// 'birthplace': deputeInfos.birthplace,
	// 					// 'mandateStartingDate': mandateStartingDate,
	// 					// 'responsabilities': deputeInfos.responsabilities,
	// 					// 'responsabilities_out_of_parliament': deputeInfos.responsabilities_out_of_parliament,
	// 					// 'parliament_groups': deputeInfos.parliament_groups,
	// 					// 'websites': deputeInfos.websites,
	// 					// 'emails': deputeInfos.emails,
	// 					// 'addresses': deputeInfos.addresses,
	// 					// 'previousMandates': deputeInfos.previousMandates,
	// 					// 'otherMandates': deputeInfos.otherMandates,
	// 					// 'previousOtherMandates': deputeInfos.previousOtherMandates,
	// 					// 'job': deputeInfos.job,
	// 					// 'officialUrl': deputeInfos.officialUrl,
	// 					// 'twitter': deputeInfos.twitter
	// 				};
	// 			})
	// 		}
	// 	})
	// }

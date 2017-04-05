var moment = require('moment');

const PARAM_DEPUTE_ID = "{depute_id}";
const MANDATE_NUMBER = "14";
const BASE_URL = "http://www2.assemblee-nationale.fr/";
const DEPUTE_PHOTO_URL = BASE_URL + "static/tribun/" + MANDATE_NUMBER + "/photos/" + PARAM_DEPUTE_ID + ".jpg"

self = module.exports = {
	getDeputeWithId: function(id) {
		return Depute.findOne().where({
			id: id
		}).then(function(depute) {
			return depute;
		})
	},

	getDeputeInfosWithId: function(id) {
		return self.getDeputeWithId(id)
		.then(function(depute) {
			console.log(depute)
			if (depute) {
				return DeputeInfos.findOne().where({
					officialId: depute.officialId
				}).then(function(deputeInfos) {
					var birthdate = moment(deputeInfos.birthdate).format("DD/MM/YYYY");
					var mandateStartingDate = moment(deputeInfos.mandateStartingDate).format("DD/MM/YYYY");
		    	var photoUrl = DEPUTE_PHOTO_URL.replace(PARAM_DEPUTE_ID, deputeInfos.officialId)
					return {
						'id': id,
						'firstname': deputeInfos.firstname,
						'lastname': deputeInfos.lastname,
						'birthdate': birthdate,
						'birthplace': deputeInfos.birthplace,
						'departmentNumber': deputeInfos.departmentNumber,
						'circonscriptionName': deputeInfos.circonscriptionName,
						'circonscriptionNumber': deputeInfos.circonscriptionNumber,
						'mandateStartingDate': mandateStartingDate,
						'partyInvolvment': deputeInfos.partyInvolvment,
						'partyShort': deputeInfos.partyShort,
						'party': deputeInfos.party,
						'responsabilities': deputeInfos.responsabilities,
						'responsabilities_out_of_parliament': deputeInfos.responsabilities_out_of_parliament,
						'parliament_groups': deputeInfos.parliament_groups,
						'websites': deputeInfos.websites,
						'emails': deputeInfos.emails,
						'addresses': deputeInfos.addresses,
						'previousMandates': deputeInfos.previousMandates,
						'otherMandates': deputeInfos.otherMandates,
						'prevousOtherMandates': deputeInfos.prevousOtherMandates,
						'job': deputeInfos.job,
						'officialUrl': deputeInfos.officialUrl,
						'photoUrl': photoUrl,
						'numberOfMandates': deputeInfos.numberOfMandates,
						'twitter': deputeInfos.twitter
					};
				})
			}
		})
	}
};

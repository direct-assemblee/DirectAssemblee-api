let Promise = require('bluebird');
let ResponseBuilder = require('./ResponseBuilder.js');
let DateHelper = require('../../services/helpers/DateHelper.js');

const BASE_URL = 'http://www2.assemblee-nationale.fr/';
const PARAM_DEPUTY_ID = '{deputy_id}';
const PARAM_MANDATE_NUMBER = '15';
const DEPUTY_PHOTO_URL = BASE_URL + 'static/tribun/' + PARAM_MANDATE_NUMBER + '/photos/' + PARAM_DEPUTY_ID + '.jpg'

var self = module.exports = {
    prepareSimpleDeputyResponse: function(deputy) {
        return self.cleanSimpleDeputyResponse(deputy);
    },

    prepareSimpleDeputiesResponse: function(deputies, departments) {
        return Promise.map(deputies, function(deputy) {
            let formattedDeputy = deputy;
            if (deputy) {
                deputy.department = self.getDepartmentForDeputy(deputy, departments);
                formattedDeputy = self.cleanSimpleDeputyResponse(deputy);
            }
            return formattedDeputy;
        }, { concurrency: 5 })
    },

    getDepartmentForDeputy: function(deputy, departments) {
    	let department
    	for (let i in departments) {
    		if (departments[i].id === deputy.departmentId) {
    			department = departments[i];
    			break;
    		}
    	}
    	return department;
    },

    cleanSimpleDeputyResponse: function(deputy) {
        deputy = self.prepareDeputyResponse(deputy);
        delete deputy.phone;
        delete deputy.email;
        delete deputy.job;
        delete deputy.currentMandateStartDate;
        delete deputy.age;
        return deputy;
    },

    prepareDeputyResponse: function(deputy) {
        deputy.id = parseInt(deputy.officialId);
        deputy.seatNumber = parseInt(deputy.seatNumber)
        deputy.department.id = parseInt(deputy.department.id)
        deputy.district = parseInt(deputy.district)
        deputy.photoUrl = DEPUTY_PHOTO_URL.replace(PARAM_DEPUTY_ID, deputy.officialId)
        deputy.age = DateHelper.findAge(deputy.birthDate);
        deputy.declarations = self.prepareDeclarationsResponse(deputy.declarations);
        if (deputy.currentMandateStartDate) {
            deputy.currentMandateStartDate = DateHelper.formatDateForWS(deputy.currentMandateStartDate);
        }
        let permanentCommission = getPermanentCommission(deputy)
        if (permanentCommission != null) {
            deputy.commission = permanentCommission
        }
        if (parseInt(deputy.activityRate) >= 0) {
            deputy.activityRate = Math.round(deputy.activityRate);
        } else {
            delete deputy.activityRate;
        }
        delete deputy.birthDate;
        delete deputy.department.slug;
        delete deputy.department.soundexName;
        delete deputy.department.nameUppercase;
        delete deputy.departmentId;
        delete deputy.officialId;
        delete deputy.gender;
        delete deputy.createdAt;
        delete deputy.updatedAt;
        delete deputy.mandateEndDate;
        delete deputy.mandateEndReason;
        return deputy;
    },

    prepareDeclarationsResponse: function(declarations) {
        for (let i in declarations) {
            delete declarations[i].deputyId;
            delete declarations[i].id;
            delete declarations[i].createdAt;
            delete declarations[i].updatedAt;
            declarations[i].date = DateHelper.formatDateForWS(declarations[i].date);
        }
        return declarations;
    }
}

let getPermanentCommission = function(deputy) {
    for (let i in deputy.roles) {
        let role = deputy.roles[i]
        if (role.instanceType === 'Commission permanente') {
            if (role.positions != null && role.positions.length > 0 && role.positions[0] != null && role.positions[0].instances != null && role.positions[0].instances.length > 0) {
                return role.positions[0].instances[0]
            }
        }
    }
    return null
}

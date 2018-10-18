let WorkTypeService = require('../WorkTypeService')

let allWorkTypes;

let self = module.exports = {
    QUESTION: { id: 1, name: 'Question' },
    REPORT: { id: 2, name: 'Rapport' },
    PROPOSITION: { id: 3, name: 'Proposition' },
    COMMISSION: { id: 4, name: 'Commission' },
    PUBLIC_SESSION: { id: 5, name: 'Séance publique' },

    BALLOT_SOLEMN: 'Scrutin solennel',
    BALLOT_ORDINARY: 'Scrutin ordinaire',
    BALLOT_MOTION: 'Motion de censure',
    BALLOT_OTHER: 'Autre scrutin',
    BALLOT_UNDEFINED: 'Scrutin (type à venir)',

    getWorkTypeName: async function(workTypeId) {
        let workTypeName = "Activity parlementaire (type inconnu)"
        if (allWorkTypes == null) {
            allWorkTypes = await WorkTypeService.findAllWorkTypes()
        }
        for (let i in allWorkTypes) {
            if (allWorkTypes[i].id == workTypeId) {
                workTypeName = allWorkTypes[i].name
                break;
            }
        }
        return workTypeName
    },

    workHasExtra: async function(workTypeId) {
        let workTypeName = await self.getWorkTypeName(workTypeId);
        return workTypeName === Constants.WORK_TYPE_PROPOSITIONS || workTypeName === Constants.WORK_TYPE_COSIGNED_PROPOSITIONS
            || workTypeName === Constants.WORK_TYPE_COMMISSIONS
    },

    isEligibleForPush: function(workType) {
        return !self.isPublicSession(workType) && !self.isCommission(workType)
    },

    isPublicSession: function(workType) {
        return self.isWorkType(workType, self.PUBLIC_SESSION)
    },

    isQuestion: function(workType) {
        return self.isWorkType(workType, self.QUESTION)
    },

    isCommission: function(workType) {
        return self.isWorkType(workType, self.COMMISSION)
    },

    isProposition: function(workType) {
        return self.isWorkType(workType, self.PROPOSITION)
    },

    isWorkType: function(searchWorkType, referenceWorkType) {
        if (searchWorkType && searchWorkType.name) {
            return searchWorkType.name == referenceWorkType.name
        } else {
            return searchWorkType == referenceWorkType.id
        }
    },

    isMotion: function(ballotType) {
        return ballotType == self.BALLOT_MOTION
    }
}

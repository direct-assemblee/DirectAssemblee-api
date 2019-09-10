let WorkTypeService = require('../WorkTypeService')
let WorkSubtypeService = require('../WorkSubtypeService')

let allWorkSubtypes;

let self = module.exports = {
    QUESTION: { id: 1, name: 'Question' },
    REPORT: { id: 2, name: 'Rapport' },
    PROPOSITION: { id: 3, name: 'Proposition' },
    COMMISSION: { id: 4, name: 'Commission' },
    PUBLIC_SESSION: { id: 5, name: 'Séance publique' },

    getNameForSubtype: async function(subtypeId) {
        let workTypeName = "Activité parlementaire (type inconnu)"
        if (allWorkSubtypes == null) {
            allWorkSubtypes = await WorkSubtypeService.findAll()
        }
        allWorkSubtypes.forEach(workSubtype => {
            if (workSubtype.id == subtypeId) {
                if (workSubtype.parentTypeId.id == self.COMMISSION.id || workSubtype.parentTypeId.id == self.PUBLIC_SESSION.id) {
                    workTypeName = workSubtype.parentTypeId.displayName;
                } else {
                    workTypeName = workSubtype.name;
                }
            }
        })
        return workTypeName;
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

    isReport: function(workType) {
        return self.isWorkType(workType, self.REPORT)
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
    }
}

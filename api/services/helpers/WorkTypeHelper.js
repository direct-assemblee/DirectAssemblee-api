let WorkSubtypeService = require('../WorkSubtypeService')
let Promise = require('bluebird');

let self = module.exports = {
    QUESTION: { id: 1, name: 'Question' },
    REPORT: { id: 2, name: 'Rapport' },
    PROPOSITION: { id: 3, name: 'Proposition' },
    COMMISSION: { id: 4, name: 'Commission' },
    PUBLIC_SESSION: { id: 5, name: 'Séance publique' },

    getNameForSubtype: async function(subtypeId) {
        return WorkSubtypeService.findAll()
        .then(subtypes => {
            let workTypeName = "Activité parlementaire (type inconnu)"
            subtypes.forEach(workSubtype => {
                if (workSubtype.id == subtypeId) {
                    if (workSubtype.parentTypeId.id == self.COMMISSION.id || workSubtype.parentTypeId.id == self.PUBLIC_SESSION.id) {
                        workTypeName = workSubtype.parentTypeId.displayName;
                    } else {
                        workTypeName = workSubtype.name;
                    }
                }
            })
            return workTypeName;
        })
    },

    workHasExtra: async function(workSubtype) {
        let isProposition = await self.isProposition(workSubtype)
        let isCommission = await self.isCommission(workSubtype)
        return isProposition || isCommission
    },

    isEligibleForPush: async function(workSubtype) {
        let isPublicSession = await self.isPublicSession(workSubtype)
        let isCommission = await self.isCommission(workSubtype)
        return !(isPublicSession || isCommission)
    },

    isPublicSession: async function(workSubtype) {
        return await isWorkType(workSubtype, self.PUBLIC_SESSION)
    },

    isQuestion: async function(workSubtype) {
        return await isWorkType(workSubtype, self.QUESTION)
    },

    isReport: async function(workSubtype) {
        return await isWorkType(workSubtype, self.REPORT)
    },

    isCommission: async function(workSubtype) {
        return await isWorkType(workSubtype, self.COMMISSION)
    },

    isProposition: async function(workSubtype) {
        return await isWorkType(workSubtype, self.PROPOSITION)
    }
}

let isWorkType = async function(searchWorkSubtype, referenceWorkType) {
    let parentTypeId = await findParentTypeId(searchWorkSubtype)
    return referenceWorkType.id == parentTypeId
}

let findParentTypeId = function(searchedTypeNameOrId) {
    return WorkSubtypeService.findAll()
    .then(subtypes => {
        let id;
        for (let i in subtypes) {
            if (isCorrectType(subtypes[i], searchedTypeNameOrId)) {
                id = subtypes[i].parentTypeId.id
                break;
            }
        }
        return id
    })
}

let isCorrectType = function(referenceType, searchedTypeNameOrId) {
    return searchedTypeNameOrId == referenceType.id
        || (typeof searchedTypeNameOrId === 'string' && searchedTypeNameOrId.startsWith(referenceType.officialPath))
}

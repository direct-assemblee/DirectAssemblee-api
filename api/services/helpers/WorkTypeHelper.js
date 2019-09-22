let WorkSubtypeService = require('../WorkSubtypeService')
let Promise = require('bluebird');

let self = module.exports = {
    QUESTION: { id: 1, name: 'Question' },
    REPORT: { id: 2, name: 'Rapport' },
    PROPOSITION: { id: 3, name: 'Proposition' },
    COMMISSION: { id: 4, name: 'Commission' },
    PUBLIC_SESSION: { id: 5, name: 'Séance publique' },

    getWorkTypeName: async function(workTypeId) {
        let workTypeName = "Activity parlementaire (type inconnu)"
        if (allWorkTypes == null) {
            allWorkTypes = await WorkTypeService.findAll()
        }
        for (let i in allWorkTypes) {
            if (allWorkTypes[i].id == workTypeId) {
                workTypeName = allWorkTypes[i].name
                break;
            }
        }
        return workTypeName
    },

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

    getSubtype: async function(subtypeId) {
        return WorkSubtypeService.find(subtypeId)
        .then(foundSubtype => {
            if (foundSubtype != null) {
                let subtype = {
                    id: foundSubtype.id,
                    name: foundSubtype.name,
                    parentType: {
                        id: foundSubtype.parentTypeId.id,
                        name: foundSubtype.parentTypeId.displayName
                    }
                }
                return subtype
            }
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

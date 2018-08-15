let WorkTypeService = require('../../services/WorkTypeService')
let BallotTypeService = require('../../services/BallotTypeService')

let workTypes;
let ballotTypes;

module.exports = {
    QUESTION: 'Question',
    REPORT: 'Rapport',
    PROPOSITION: 'Proposition',
    COMMISSION: 'Commission',
    PUBLIC_SESSION: 'Séance publique',

    BALLOT_SOLEMN: 'Scrutin solennel',
    BALLOT_ORDINARY: 'Scrutin ordinaire',
    BALLOT_MOTION: 'Motion de censure',
    BALLOT_OTHER: 'Autre scrutin',
    BALLOT_UNDEFINED: 'Scrutin (type à venir)',

    getWorkTypeId: async function(searchedType) {
        if (!workTypes) {
            workTypes = await WorkTypeService.findAllWorkTypes()
        }
        return findCorrectId(workTypes, searchedType)
    },

    getBallotTypeId: async function(searchedType) {
        if (!ballotTypes) {
            ballotTypes = await BallotTypeService.findAllBallotTypes()
        }
        return findCorrectId(ballotTypes, searchedType)
    }
}

let findCorrectId = function(searchedType) {
    let id;
    for (let i in workTypes) {
        if (isCorrectType(workTypes[i], searchedType)) {
            id = workTypes[i].id
            break;
        }
    }
    return id
}

let isCorrectType = function(workType, searchedType) {
    switch (searchedType) {
        case QUESTION:
        return workType.name == "Question"
        case REPORT:
        return workType.name == "Rapport"
        case PROPOSITION:
        return workType.name == "Proposition"
        case COMMISSION:
        return workType.name == "Commission"
        case PUBLIC_SESSION:
        return workType.name == "Séance publique"
        break;
    }
}

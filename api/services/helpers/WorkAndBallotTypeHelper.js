let WorkTypeService = require('../../services/WorkTypeService')
let BallotTypeService = require('../../services/BallotTypeService')

let workTypes;
let ballotTypes;

let self = module.exports = {
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

    isEligibleForPush: function(workType) {
        return !self.isPublicSession(workType) && !self.isCommission(workType)
    },

    isPublicSession: function(workType) {
        return workType == self.WORK_OFFICIAL_PATH_PUBLIC_SESSIONS
    },

    isQuestion: function(workType) {
        return workType == self.WORK_OFFICIAL_PATH_QUESTIONS
    },

    isCommission: function(workType) {
        return workType == self.WORK_OFFICIAL_PATH_COMMISSIONS
    },

    isProposition: function(workType) {
        return workType == self.WORK_OFFICIAL_PATH_PROPOSITIONS || workType == self.WORK_OFFICIAL_PATH_COSIGNED_PROPOSITIONS
    },

    isMotion: function(ballotType) {
        return ballotType == self.BALLOT_MOTION
    }
}

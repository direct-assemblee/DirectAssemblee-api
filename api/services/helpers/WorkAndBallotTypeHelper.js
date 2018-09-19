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
        if (searchWorkType.name) {
            return searchWorkType.name == referenceWorkType.name
        } else {
            return searchWorkType == referenceWorkType.id
        }
    },

    isMotion: function(ballotType) {
        return ballotType == self.BALLOT_MOTION
    }
}

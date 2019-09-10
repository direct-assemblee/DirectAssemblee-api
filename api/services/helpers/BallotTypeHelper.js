let self = module.exports = {
    BALLOT_SOLEMN: 'Scrutin solennel',
    BALLOT_ORDINARY: 'Scrutin ordinaire',
    BALLOT_MOTION: 'Motion de censure',
    BALLOT_OTHER: 'Autre scrutin',
    BALLOT_UNDEFINED: 'Scrutin (type à venir)',

    isMotion: function(ballotType) {
        return ballotType == self.BALLOT_MOTION
    }
}

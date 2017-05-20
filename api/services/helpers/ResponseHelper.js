module.exports = {
  createExtendedVoteForTimeline: function(ballot, voteValue) {
  	return {
      title: ballot.title,
  		theme: ballot.theme,
  		type: ballot.type,
  		date: DateHelper.formatDateForWS(ballot.date),
  		voteExtraInfo: {
  			id: ballot.id,
  			voteValue: voteValue,
        isAdopted: ballot.isAdopted ? true : false
  		}
  	}
  },

  createVoteForPush: function(ballot, vote) {
    return {
      title: ballot.title,
      theme: ballot.theme,
      ballotId : ballot.id,
      deputyId : vote.deputyId.id,
      value : vote.value
    }
  },

  createVoteSentenceForPush: function(vote) {
    var sentence = "Votre député ";
    if (vote === "motion_of_censure") {
      sentence += vote.value === "for" ? "a" : "n\'a pas";
      sentence += " signé la motion de censure";
    } else {
      switch (vote.value) {
        case "for":
          sentence += "a voté POUR";
          break;
        case "against":
          sentence += "a voté CONTRE";
          break;
        case "blank":
          sentence += "a voté BLANC";
          break;
        case "missing":
          sentence += "était ABSENT au vote";
          break;
        case "non-voting":
          sentence += "était NON-VOTANT";
          break;
      }
    }
    return sentence;
  },

  createVoteValueForWS: function(ballotType, vote) {
    if (ballotType === "motion_of_censure") {
      return vote && vote.value === "for" ? "signed" : "not_signed"
    } else {
      return vote ? vote.value : 'missing';
    }
  }
}

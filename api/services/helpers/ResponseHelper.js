var DateHelper = require('./DateHelper.js');

const WORK_TYPE_VOTE_SOLEMN = "vote_solemn";
const WORK_TYPE_VOTE_ORDINARY = "vote_ordinary";
const WORK_TYPE_VOTE_CENSURE = "vote_motion_of_censure";
const WORK_TYPE_VOTE_OTHER = "vote_others";
const WORK_TYPE_QUESTIONS = "question";
const WORK_TYPE_REPORTS = "report";
const WORK_TYPE_PROPOSITIONS = "law_proposal";
const WORK_TYPE_COSIGNED_PROPOSITIONS = "cosigned_law_proposal";
const WORK_TYPE_COMMISSIONS = "commission";
const WORK_TYPE_PUBLIC_SESSIONS = "public_session";

const WORK_TYPES = [ WORK_TYPE_QUESTIONS, WORK_TYPE_REPORTS, WORK_TYPE_PROPOSITIONS, WORK_TYPE_COSIGNED_PROPOSITIONS, WORK_TYPE_COMMISSIONS, WORK_TYPE_PUBLIC_SESSIONS ];

const BALLOT_TYPE_ORDINARY = { "dbname" : "SOR", "name" : WORK_TYPE_VOTE_ORDINARY, "displayname": "Scrutin ordinaire" };
const BALLOT_TYPE_SOLEMN = { "dbname" : "SSO", "name" : WORK_TYPE_VOTE_SOLEMN, "displayname": "Scrutin solennel" };
const BALLOT_TYPE_OTHER = { "dbname" : "AUT", "name" : WORK_TYPE_VOTE_OTHER, "displayname": "Autre scrutin" };
const BALLOT_TYPE_CENSURE = { "dbname" : "motion_of_censure", "name" : WORK_TYPE_VOTE_CENSURE, "displayname": "Motion de censure" };
const BALLOT_TYPES = [ BALLOT_TYPE_ORDINARY, BALLOT_TYPE_SOLEMN, BALLOT_TYPE_OTHER, BALLOT_TYPE_CENSURE ];


self = module.exports = {
    createWorkForTimeline: function(work) {
        return {
            type: work.type,
            date: DateHelper.formatDateForWS(work.date),
            title: work.title,
            theme: work.theme,
            description: work.description
        }
    },

    createExtendedVoteForTimeline: function(ballot, voteValue) {
        return {
            type: self.getBallotTypeName(ballot.type),
            date: DateHelper.formatDateForWS(ballot.date),
            title: self.getBallotTypeDisplayName(ballot.type),
            theme: ballot.theme,
            description: ballot.title,
            voteExtraInfo: {
                id: ballot.id,
                voteValue: voteValue,
                isAdopted: ballot.isAdopted ? true : false
            }
        }
    },

    prepareSimplifiedBallotResponse: function(ballot) {
        return {
            id: ballot.id,
            date: DateHelper.formatDateForWS(ballot.date),
            title: self.getBallotTypeDisplayName(ballot.type),
            theme: ballot.theme,
            description: ballot.title,
            type: self.getBallotTypeName(ballot.type),
            isAdopted: ballot.isAdopted ? true : false
        }
    },

    prepareBallotResponse: function(ballot) {
        delete ballot.createdAt;
        delete ballot.updatedAt;
        delete ballot.officialId;
        delete ballot.dateDetailed;
        delete ballot.analysisUrl;
        ballot.date = DateHelper.formatDateForWS(ballot.date);
        ballot.type = self.getBallotTypeName(ballot.type)
        ballot.totalVotes = parseInt(ballot.totalVotes);
        ballot.yesVotes = parseInt(ballot.yesVotes);
        ballot.noVotes = parseInt(ballot.noVotes);
        ballot.blankVotes = ballot.totalVotes - ballot.yesVotes - ballot.noVotes;
        ballot.missing = NUMBER_OF_DEPUTIES - ballot.totalVotes;
        ballot.isAdopted = ballot.isAdopted ? true : false;
        return ballot;
    },

    getBallotTypeName: function(ballotType) {
        return getBallotType(ballotType).name;
    },

    getBallotTypeDisplayName: function(ballotType) {
        return getBallotType(ballotType).displayname;
    },

    createVoteValueForWS: function(ballotType, vote) {
        if (ballotType === "motion_of_censure") {
            return vote && vote.value === "for" ? "signed" : "not_signed"
        } else {
            return vote ? vote.value : 'missing';
        }
    },

    createVoteForPush: function(ballot, vote) {
        return {
            title: ballot.title,
            theme: ballot.theme,
            ballotId : ballot.id,
            deputyId : vote.deputyId.id,
            value : self.createVoteValueForWS(ballot.type, vote)
        }
    },

    createMissingVoteForPush: function(ballot, deputy) {
        return {
            title: ballot.title,
            theme: ballot.theme,
            ballotId : ballot.id,
            deputyId : deputy.id,
            value : 'missing'
        }
    },

    createPayloadForActivity: function(deputyId, activity) {
        var payload;
        if (activity.ballotId) {
            payload = createPayloadForVote(deputyId, activity);
        } else {
            payload = createPayloadForWork(deputyId, activity);
        }
        return payload;
    }
}

var getBallotType = function(ballotType) {
    var ballotType;
    for (i in BALLOT_TYPES) {
        if (BALLOT_TYPES[i].shortname === ballotType) {
            ballotType = BALLOT_TYPES[i];
            break;
        }
    }
    return ballotType;
}

var createPayloadForVote = function(deputyId, vote) {
    var body = vote.theme ? vote.theme + " : " : "";
    body += vote.title;
    var payload = {
        notification: {
            title: createVoteTitleForPush(vote),
            body: body.substring(0, 197) + "..."
        },
        data: {
            deputyId:  "" + deputyId,
            ballotId:  "" + vote.ballotId
        }
    }
    return payload;
}

var createPayloadForWork = function(deputyId, work) {
    var title = createWorkTitleForPush(work)
    var body = work.theme ? work.theme + " : " : "";
    body += work.description;
    var payload = {
        notification: {
            title: title,
            body: body.substring(0, 197) + "..."
        },
        data: {
            deputyId:  "" + deputyId
        }
    }
    return payload;
}

var createVoteTitleForPush = function(vote) {
    var title = "Votre député ";
    if (vote.type === "vote_motion_of_censure") {
        title += vote.value === "for" ? "a" : "n\'a pas";
        title += " signé la motion de censure";
    } else {
        switch (vote.value) {
            case "for":
            title += "a voté POUR";
            break;
            case "against":
            title += "a voté CONTRE";
            break;
            case "blank":
            title += "a voté BLANC";
            break;
            case "missing":
            title += "était ABSENT au vote";
            break;
            case "non-voting":
            title += "était NON-VOTANT";
            break;
        }
    }
    return title;
}

var createWorkTitleForPush = function(work) {
    var title = "Votre député ";
    switch(work.type) {
        case WORK_TYPE_QUESTIONS:
        title += "a posé une question";
        break;
        case WORK_TYPE_REPORTS:
        title += "a rédigé un rapport";
        break;
        case WORK_TYPE_PROPOSITIONS:
        title += "a proposé une loi";
        break;
        case WORK_TYPE_COSIGNED_PROPOSITIONS:
        title += "a co-signé une proposition de loi";
        break;
        case WORK_TYPE_COMMISSIONS:
        title += "a participé à une commission";
        break;
        case WORK_TYPE_PUBLIC_SESSIONS:
        title += "a participé à une séance publique";
        break;
    }
    return title;
}

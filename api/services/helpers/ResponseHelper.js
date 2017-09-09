let DateHelper = require('./DateHelper.js');

const WORK_TYPE_VOTE_SOLEMN = 'vote_solemn';
const WORK_TYPE_VOTE_ORDINARY = 'vote_ordinary';
const WORK_TYPE_VOTE_CENSURE = 'vote_motion_of_censure';
const WORK_TYPE_VOTE_OTHER = 'vote_others';
const WORK_TYPE_QUESTIONS = 'question';
const WORK_TYPE_REPORTS = 'report';
const WORK_TYPE_PROPOSITIONS = 'law_proposal';
const WORK_TYPE_COSIGNED_PROPOSITIONS = 'cosigned_law_proposal';
const WORK_TYPE_COMMISSIONS = 'commission';
const WORK_TYPE_PUBLIC_SESSIONS = 'public_session';

const BALLOT_TYPE_ORDINARY = { 'dbname' : 'SOR', 'name' : WORK_TYPE_VOTE_ORDINARY, 'displayname': 'Scrutin ordinaire' };
const BALLOT_TYPE_SOLEMN = { 'dbname' : 'SSO', 'name' : WORK_TYPE_VOTE_SOLEMN, 'displayname': 'Scrutin solennel' };
const BALLOT_TYPE_OTHER = { 'dbname' : 'AUT', 'name' : WORK_TYPE_VOTE_OTHER, 'displayname': 'Autre scrutin' };
const BALLOT_TYPE_CENSURE = { 'dbname' : 'motion_of_censure', 'name' : WORK_TYPE_VOTE_CENSURE, 'displayname': 'Motion de censure' };
const BALLOT_TYPES = [ BALLOT_TYPE_ORDINARY, BALLOT_TYPE_SOLEMN, BALLOT_TYPE_OTHER, BALLOT_TYPE_CENSURE ];

const NUMBER_OF_DEPUTIES = 577;

let self = module.exports = {
    createBallotDetailsResponse: function(ballot, deputy, voteValue) {
        let ballotResponse = self.createBallotResponse(ballot, true);
        ballotResponse.userDeputyVote = {
            'voteValue': voteValue,
            'deputy': {
                'firstname': deputy.firstname,
                'lastname': deputy.lastname
            }
        }
        return ballotResponse;
    },

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
        let ballotResponse = self.createBallotResponse(ballot, false);
        ballotResponse.voteExtraInfo =  {
            id: ballot.id,
            voteValue: voteValue,
            isAdopted: ballot.isAdopted ? true : false
        }
        return ballotResponse;
    },

    createBallotResponse: function(ballot, addToCurrentBallot) {
        let response = addToCurrentBallot ? ballot : {};
        response.type = self.getBallotTypeName(ballot.type);
        response.date = DateHelper.formatDateForWS(ballot.date);
        response.description = ballot.title;
        response.title = self.getBallotTypeDisplayName(ballot.type);
        response.theme = ballot.theme;
        return response;
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
        ballot.missing = NUMBER_OF_DEPUTIES - ballot.totalVotes - ballot.nonVoting;
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
        if (ballotType === 'motion_of_censure') {
            return vote && vote.value === 'for' ? 'signed' : 'not_signed'
        } else {
            return vote ? vote.value : 'missing';
        }
    },

    createVoteForPush: function(ballot, vote) {
        return {
            title: ballot.title,
            theme: ballot.theme,
            ballotId : ballot.id,
            deputyId : vote.deputyId.officialId,
            value : self.createVoteValueForWS(ballot.type, vote)
        }
    },

    createMissingVoteForPush: function(ballot, deputy) {
        return {
            title: ballot.title,
            theme: ballot.theme,
            ballotId : ballot.id,
            deputyId : deputy.officialId,
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

let getBallotType = function(ballotType) {
    var type;
    for (let i in BALLOT_TYPES) {
        if (BALLOT_TYPES[i].dbname === ballotType || BALLOT_TYPES[i].name === ballotType) {
            type = BALLOT_TYPES[i];
            break;
        }
    }
    return type;
}

let createPayloadForVote = function(deputyId, vote) {
    let body = vote.theme ? vote.theme + ' : ' : '';
    body += vote.title;
    let payload = {
        notification: {
            title: createVoteTitleForPush(vote),
            body: body.substring(0, 197) + '...'
        },
        data: {
            deputyId:  '' + deputyId,
            ballotId:  '' + vote.ballotId
        }
    }
    return payload;
}

let createPayloadForWork = function(deputyId, work) {
    let title = createWorkTitleForPush(work)
    let body = work.theme ? work.theme + ' : ' : '';
    body += work.description;
    let payload = {
        notification: {
            title: title,
            body: body.substring(0, 197) + '...'
        },
        data: {
            deputyId:  '' + deputyId
        }
    }
    return payload;
}

let createVoteTitleForPush = function(vote) {
    let title = 'Votre député ';
    if (vote.type === 'vote_motion_of_censure') {
        title += vote.value === 'for' ? 'a' : 'n\'a pas';
        title += ' signé la motion de censure';
    } else {
        switch (vote.value) {
            case 'for':
            title += 'a voté POUR';
            break;
            case 'against':
            title += 'a voté CONTRE';
            break;
            case 'blank':
            title += 'a voté BLANC';
            break;
            case 'missing':
            title += 'était ABSENT au vote';
            break;
            case 'non-voting':
            title += 'était NON-VOTANT';
            break;
        }
    }
    return title;
}

let createWorkTitleForPush = function(work) {
    let title = 'Votre député ';
    switch(work.type) {
        case WORK_TYPE_QUESTIONS:
        title += 'a posé une question';
        break;
        case WORK_TYPE_REPORTS:
        title += 'a rédigé un rapport';
        break;
        case WORK_TYPE_PROPOSITIONS:
        title += 'a proposé une loi';
        break;
        case WORK_TYPE_COSIGNED_PROPOSITIONS:
        title += 'a co-signé une proposition de loi';
        break;
        case WORK_TYPE_COMMISSIONS:
        title += 'a participé à une commission';
        break;
        case WORK_TYPE_PUBLIC_SESSIONS:
        title += 'a participé à une séance publique';
        break;
    }
    return title;
}

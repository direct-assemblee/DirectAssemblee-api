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

const BASE_URL = 'http://www2.assemblee-nationale.fr/';
const PARAM_DEPUTY_ID = '{deputy_id}';
const PARAM_MANDATE_NUMBER = '15';
const DEPUTY_PHOTO_URL = BASE_URL + 'static/tribun/' + PARAM_MANDATE_NUMBER + '/photos/' + PARAM_DEPUTY_ID + '.jpg'

let self = module.exports = {
    prepareSimpleDeputyResponse: function(deputy) {
        deputy = self.prepareDeputyResponse(deputy);
        delete deputy.commission;
        delete deputy.phone;
        delete deputy.email;
        delete deputy.job;
        delete deputy.currentMandateStartDate;
        return deputy;
    },

    prepareDeputyResponse: function(deputy) {
        deputy.id = parseInt(deputy.officialId);
        deputy.seatNumber = parseInt(deputy.seatNumber)
        deputy.department.id = parseInt(deputy.department.id)
        deputy.district = parseInt(deputy.district)
        deputy.photoUrl = DEPUTY_PHOTO_URL.replace(PARAM_DEPUTY_ID, deputy.officialId)
        deputy.age = DateHelper.findAge(deputy.birthDate);
        delete deputy.birthDate;
        delete deputy.department.slug;
        delete deputy.department.soundexName;
        delete deputy.department.nameUppercase;
        delete deputy.departmentId;
        delete deputy.officialId;
        delete deputy.gender;
        delete deputy.createdAt;
        delete deputy.updatedAt;
        delete deputy.mandateEndDate;
        delete deputy.mandateEndReason;
        return deputy;
    },

    createBallotDetailsResponse: function(ballot, deputy, voteValue) {
        let ballotResponse = self.prepareBallotResponse(ballot);
        ballotResponse.extraBallotInfo.deputyVote = {
            'voteValue': self.createVoteValueForWS(ballot.type, voteValue),
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
            theme: createThemeResponse(work.themeId),
            description: work.description
        }
    },

    createBallotResponse: function(ballot, addToCurrentBallot) {
        let response = addToCurrentBallot ? ballot : {};
        response.type = self.getBallotTypeName(ballot.type);
        response.date = DateHelper.formatDateForWS(ballot.date);
        response.description = ballot.title;
        response.title = self.getBallotTypeDisplayName(ballot.type);
        response.theme = createThemeResponse(ballot.themeId);
        return response;
    },

    prepareSimplifiedBallotResponse: function(ballot) {
        return {
            id: ballot.id,
            date: DateHelper.formatDateForWS(ballot.date),
            title: self.getBallotTypeDisplayName(ballot.type),
            theme: createThemeResponse(ballot.themeId),
            description: ballot.title,
            type: self.getBallotTypeName(ballot.type),
            isAdopted: ballot.isAdopted ? true : false
        }
    },

    prepareBallotResponse: function(ballot) {
        ballot.date = DateHelper.formatDateForWS(ballot.date);
        ballot.description = ballot.title;
        ballot.title = self.getBallotTypeDisplayName(ballot.type);
        ballot.type = self.getBallotTypeName(ballot.type)
        ballot.theme = createThemeResponse(ballot.themeId);
        ballot.extraBallotInfo = {};
        ballot.extraBallotInfo.id = parseInt(ballot.id);
        ballot.extraBallotInfo.totalVotes = parseInt(ballot.totalVotes);
        ballot.extraBallotInfo.yesVotes = parseInt(ballot.yesVotes);
        ballot.extraBallotInfo.noVotes = parseInt(ballot.noVotes);
        ballot.extraBallotInfo.nonVoting = parseInt(ballot.nonVoting);
        ballot.extraBallotInfo.blankVotes = ballot.totalVotes - ballot.yesVotes - ballot.noVotes;
        ballot.extraBallotInfo.missing = NUMBER_OF_DEPUTIES - ballot.totalVotes - ballot.nonVoting;
        ballot.extraBallotInfo.isAdopted = ballot.isAdopted ? true : false;
        ballot.extraBallotInfo.fileUrl = ballot.fileUrl;

        delete ballot.id;
        delete ballot.fileUrl;
        delete ballot.nonVoting;
        delete ballot.totalVotes;
        delete ballot.yesVotes;
        delete ballot.noVotes;
        delete ballot.blankVotes;
        delete ballot.missing;
        delete ballot.isAdopted;
        delete ballot.createdAt;
        delete ballot.updatedAt;
        delete ballot.officialId;
        delete ballot.dateDetailed;
        delete ballot.analysisUrl;
        delete ballot.themeId;
        return ballot;
    },

    getBallotTypeName: function(ballotType) {
        return getBallotType(ballotType).name;
    },

    getBallotTypeDisplayName: function(ballotType) {
        return getBallotType(ballotType).displayname;
    },

    createVoteValueForWS: function(ballotType, voteValue) {
        if (ballotType.includes('motion_of_censure')) {
            return voteValue === 'for' ? 'signed' : 'not_signed'
        } else {
            return voteValue ? voteValue : 'missing';
        }
    },

    createVoteForPush: function(ballot, vote) {
        return {
            title: ballot.title,
            theme: ballot.themeId.name,
            ballotId : ballot.id,
            deputyId : vote.deputyId.officialId,
            value : self.createVoteValueForWS(ballot.type, vote.value)
        }
    },

    createMissingVoteForPush: function(ballot, deputy) {
        return {
            title: ballot.title,
            theme: ballot.themeId.name,
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
    let body = vote.themeId ? vote.themeId.name + ' : ' : '';
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
    let body = work.themeId ? work.themeId.name + ' : ' : '';
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

let createThemeResponse = function(theme) {
    if (theme) {
        delete theme.typeName;
    }
    return theme;
}

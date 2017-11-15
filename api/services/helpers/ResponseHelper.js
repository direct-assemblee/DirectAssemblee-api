let DateHelper = require('./DateHelper.js');
let QuestionHelper = require('./QuestionHelper.js')

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
        delete deputy.age;
        return deputy;
    },

    prepareDeputyResponse: function(deputy) {
        deputy.id = parseInt(deputy.officialId);
        deputy.seatNumber = parseInt(deputy.seatNumber)
        deputy.department.id = parseInt(deputy.department.id)
        deputy.district = parseInt(deputy.district)
        deputy.photoUrl = DEPUTY_PHOTO_URL.replace(PARAM_DEPUTY_ID, deputy.officialId)
        deputy.age = DateHelper.findAge(deputy.birthDate);
        deputy.declarations = self.prepareDeclarationsResponse(deputy.declarations);
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

    prepareDeclarationsResponse: function(declarations) {
        for (let i in declarations) {
            delete declarations[i].deputyId;
            delete declarations[i].id;
            delete declarations[i].createdAt;
            delete declarations[i].updatedAt;
            declarations[i].date = DateHelper.formatDateForWS(declarations[i].date);
        }
        return declarations;
    },

    createBallotDetailsResponse: function(ballot, deputy) {
        let ballotResponse = self.prepareBallotResponse(ballot);
        ballotResponse.extraBallotInfo.deputyVote = {
            'voteValue': self.createVoteValueForWS(ballot.type, ballot.deputyVote),
            'deputy': {
                'firstname': deputy.firstname,
                'lastname': deputy.lastname
            }
        }
        return ballotResponse;
    },

    createWorkForTimeline: function(work, extraInfos) {
        let response = {
            type: work.type,
            date: DateHelper.formatDateForWS(work.date),
            title: work.title,
            fileUrl: work.url
        }

        response.theme = createThemeResponse(work.themeId);

        let description = work.description;
        if (work.type === WORK_TYPE_QUESTIONS) {
            description = QuestionHelper.formatQuestionWithLineBreaks(description);
        }
        response.description = description;
        if (extraInfos && extraInfos.length > 0) {
            response.extraInfos = [];
            for (let i in extraInfos) {
                response.extraInfos.push({ 'info': extraInfos[i].info, 'value': extraInfos[i].value } )
            }
        }
        return response;
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
            id: ballot.officialId,
            date: DateHelper.formatDateForWS(ballot.date),
            title: self.getBallotTypeDisplayName(ballot.type),
            theme: createThemeResponse(ballot.themeId),
            description: ballot.title,
            type: self.getBallotTypeName(ballot.type),
            isAdopted: ballot.isAdopted ? true : false
        }
    },

    prepareBallotResponse: function(ballot) {
        return {
            date: DateHelper.formatDateForWS(ballot.date),
            description: ballot.title,
            title: self.getBallotTypeDisplayName(ballot.type),
            type: self.getBallotTypeName(ballot.type),
            theme: createThemeResponse(ballot.themeId),
            fileUrl: ballot.fileUrl,
            extraBallotInfo: {
                id: parseInt(ballot.officialId),
                totalVotes: parseInt(ballot.totalVotes),
                yesVotes: parseInt(ballot.yesVotes),
                noVotes: parseInt(ballot.noVotes),
                nonVoting: parseInt(ballot.nonVoting),
                blankVotes: ballot.totalVotes - ballot.yesVotes - ballot.noVotes,
                missing: NUMBER_OF_DEPUTIES - parseInt(ballot.totalVotes) - parseInt(ballot.nonVoting),
                isAdopted: ballot.isAdopted ? true : false
            }
        }
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
            ballotId : ballot.officialId,
            deputyId : vote.deputyId.officialId,
            value : self.createVoteValueForWS(ballot.type, vote.value)
        }
    },

    createMissingVoteForPush: function(ballot, deputy) {
        return {
            title: ballot.title,
            theme: ballot.themeId.name,
            ballotId : ballot.officialId,
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
    } else {
        theme = {
            id: 0,
            name: 'Catégorisation à venir'
        }
    }
    return theme;
}

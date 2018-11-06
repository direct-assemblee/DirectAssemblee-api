let DateHelper = require('./DateHelper.js');
let WorkAndBallotTypeHelper = require('./WorkAndBallotTypeHelper.js');
let ThemeService = require('../ThemeService.js')

let self = module.exports = {
    createVoteValueForWS: function(ballotType, voteValue) {
        if (WorkAndBallotTypeHelper.isMotion(ballotType.displayName)) {
            return voteValue === 'for' ? 'signed' : 'not_signed'
        } else {
            return voteValue ? voteValue : 'missing';
        }
    },

    createVoteForPush: function(ballot, vote) {
        let push = {
            title: ballot.title,
            ballotId : ballot.officialId,
            deputyId : vote.deputyId.officialId,
            value : self.createVoteValueForWS(ballot.type, vote.value)
        }
        if (ballot.theme) {
            push.theme = ballot.theme.name
        }
        return push;
    },

    createMissingVoteForPush: function(ballot, deputy) {
        let push = {
            title: ballot.title,
            ballotId : ballot.officialId,
            deputyId : deputy.officialId,
            value : 'missing'
        }
        if (ballot.theme) {
            push.theme = ballot.theme.name
        }
        return push;
    },

    createPayloadForActivity: function(deputyId, work) {
        let title = createWorkTitleForPush(work)
        return ThemeService.getThemefromId(work.theme)
        .then(function(theme) {
            let body = theme ? theme.name + ' : ' : '';
            body += work.description;
            let payload = {
                notification: {
                    title: title,
                    body: body.substring(0, 197) + '...'
                },
                data: {
                    deputyId: '' + deputyId,
                    workId: '' + work.id
                }
            }
            return payload;
        })
    },

    createPayloadForDailyVotes: function(deputyId, ballotsCount, theme, sameValue, counts) {
        let title = ballotsCount + ' ';
        title += ballotsCount > 1 ? 'nouveaux scrutins' : 'nouveau scrutin'
        title += ' depuis hier';

        let body = theme ? 'Thème : ' + theme + '\n' : ''
        body += 'Votre député ';
        body += sameValue ? voteValuePrefixedWording(sameValue) : ':\n' + multipleVoteValuesWording(counts);

        let payload = {
            notification: {
                title: title,
                body: body
            },
            data: {
                deputyId: '' + deputyId
            }
        }
        return payload
    }
}

let multipleVoteValuesWording = function(counts) {
    let wording = '';
    if (counts.for > 0) {
        wording += 'POUR : ' + counts.for //'\n';
    }
    if (counts.against > 0) {
        if (wording) {
            wording += ', '
        }
        wording += 'CONTRE : ' + counts.against //'\n';
    }
    if (counts.blank > 0) {
        if (wording) {
            wording += ', '
        }
        wording += 'BLANC : ' + counts.blank //'\n';
    }
    if (counts.missing > 0) {
        if (wording) {
            wording += ', '
        }
        wording += 'ABSENT : ' + counts.missing  //'\n';
    }
    if (counts.nonVoting > 0) {
        if (wording) {
            wording += ', '
        }
        wording += 'NON-VOTANT : ' + counts.nonVoting + '\n';
    }
    return wording;
}

let voteValuePrefixedWording = function(voteValue) {
    let wording;
    switch (voteValue) {
        case 'for':
        case 'against':
        case 'blank':
        wording = 'a voté ';
        break;
        case 'missing':
        case 'non-voting':
        wording = 'était ';
        break;
    }
    return wording + voteValueWording(voteValue);
}

let voteValueWording = function(voteValue) {
    let wording
    switch (voteValue) {
        case 'for':
        wording = 'POUR';
        break;
        case 'against':
        wording = 'CONTRE';
        break;
        case 'blank':
        wording = 'BLANC';
        break;
        case 'missing':
        wording = 'ABSENT';
        break;
        case 'non-voting':
        wording = 'NON-VOTANT';
        break;
    }
    return wording
}

let createWorkTitleForPush = function(work) {
    let title = 'Votre député ';
    if (WorkAndBallotTypeHelper.isQuestion(work.type)) {
        title += 'a posé une question';
    } else if (WorkAndBallotTypeHelper.isReport(work.type)) {
        title += 'a rédigé un rapport';
    } else if (WorkAndBallotTypeHelper.isProposition(work.type)) {
        title += work.isAuthor ? 'a proposé une loi' : 'a co-signé une proposition de loi';
    } else if (WorkAndBallotTypeHelper.isCommission(work.type)) {
        title += 'a participé à une commission';
    } else if (WorkAndBallotTypeHelper.isPublicSession(work.type)) {
        title += 'a participé à une séance publique';
    }
    return title;
}

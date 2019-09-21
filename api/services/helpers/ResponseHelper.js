let DateHelper = require('./DateHelper.js');
let BallotTypeHelper = require('./BallotTypeHelper.js');
let WorkTypeHelper = require('./WorkTypeHelper.js');
let ThemeService = require('../ThemeService.js')

let self = module.exports = {
    createVoteValueForWS: function(ballotType, voteValue) {
        if (BallotTypeHelper.isMotion(ballotType.displayName)) {
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
        if (ballot.lawId != null && ballot.lawId.theme) {
            push.themeId = ballot.lawId.theme
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
        if (ballot.lawId != null && ballot.lawId.theme) {
            push.themeId = ballot.lawId.theme
        }
        return push;
    },

    createPayloadForActivity: async function(deputyId, work) {
        let title = await createWorkTitleForPush(work)
        return ThemeService.getThemefromId(work.theme)
        .then(theme => {
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

let createWorkTitleForPush = async function(work) {
    let title = 'Votre député ';
    if (await WorkTypeHelper.isQuestion(work.subtypeId)) {
        title += 'a posé une question';
    } else if (await WorkTypeHelper.isReport(work.subtypeId)) {
        title += 'a rédigé un rapport';
    } else if (await WorkTypeHelper.isProposition(work.subtypeId)) {
        title += work.isAuthor ? 'a proposé une loi' : 'a co-signé une proposition de loi';
    } else if (await WorkTypeHelper.isCommission(work.subtypeId)) {
        title += 'a participé à une commission';
    } else if (await WorkTypeHelper.isPublicSession(work.subtypeId)) {
        title += 'a participé à une séance publique';
    }
    return title;
}

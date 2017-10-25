let proxyquire = require('proxyquire');
let moment = require('moment')

let buildDeputy = function(isValid, hasCurrentMandate) {
    let deputy;
    if (isValid) {
        let birthDate = moment().subtract(20, 'year');
        deputy = { officialId: 14, departmentId: 1, district: 1, seatNumber: 44, birthDate: birthDate, firstname: 'JM', lastname: 'Député' };
        if (hasCurrentMandate) {
            deputy.currentMandateStartDate = '18/06/2016';
            deputy.mandateEndDate = null;
        } else {
            deputy.mandateEndDate = '18/06/2016';
            deputy.currentMandateStartDate = null;
        }
    }
    return deputy;
}

module.exports = {
    buildDateHelperStub: function() {
        let dateHelperStub = function(){};
        dateHelperStub.getFormattedNow = function() {
            return '2017-10-10';
        }
        return dateHelperStub;
    },

    buildDeputyServiceStub: function(isValid, hasCurrentMandate) {
        let deputyServiceStub = function(){};
        deputyServiceStub.findMostRecentDeputyAtDate = function(departmentId, district, formattedNow) {
            return new Promise(function(resolve) {
                resolve(buildDeputy(isValid, hasCurrentMandate));
            });
        }
        deputyServiceStub.findDeputyWithId = function(deputyId) {
            return new Promise(function(resolve) {
                resolve(buildDeputy(isValid, hasCurrentMandate));
            });
        }
        return deputyServiceStub;
    },

    buildDepartmentServiceStub: function() {
        let departmentServiceStub = function(){};
        departmentServiceStub.findDepartmentWithId = function(departmentId) {
            return new Promise(function(resolve) {
                resolve({ id: departmentId, code: 15, name: 'fakeDepartment' });
            });
        }
        return departmentServiceStub;
    },

    buildExtraPositionServiceStub: function() {
        let extraPositionServiceStub = function(){};
        extraPositionServiceStub.getSalaryForDeputy = function(deputyId) {
            return new Promise(function(resolve) {
                resolve(7200);
            });
        }
        return extraPositionServiceStub;
    },

    buildMandateServiceStub: function() {
        let mandateServiceStub = function(){};
        mandateServiceStub.getPoliticalAgeOfDeputy = function(deputyId, currentMandateStartDate) {
            return new Promise(function(resolve) {
                resolve(10);
            });
        }
        return mandateServiceStub;
    },

    buildVoteServiceStub: function() {
        let voteServiceStub = function(){};
        voteServiceStub.findVotesBallotIds = function(deputyId, currentMandateStartDate) {
            return new Promise(function(resolve) {
                resolve([ 2, 35 ]);
            });
        }
        return voteServiceStub;
    },

    buildBallotServiceStub: function() {
        let ballotServiceStub = function(){};
        ballotServiceStub.findBallotsFromDate = function(currentMandateStartDate, solemnBallotsOnly) {
            return new Promise(function(resolve) {
                resolve([{ id: 33, officialId: 33, title: 'ballot title 33', date: '2016-12-13' }, { id: 64, officialId: 64, title: 'ballot title 64', date: '2016-12-14' }, { id: 35, officialId: 35, title: 'ballot title 35', date: '2016-12-12' }, { id: 301, officialId: 301, title: 'ballot title 301', date: '2016-12-01' }]);
            });
        }
        return ballotServiceStub;
    },

    buildWorkServiceStub: function() {
        let workServiceStub = function(){};
        workServiceStub.findWorksDatesForDeputyAfterDate = function(deputyId, currentMandateStartDate) {
            return new Promise(function(resolve) {
                resolve(['2016-12-14', '2016-09-12']);
            });
            // return new Promise(function(resolve) {
            //     resolve([{ id: 88, title: 'work 88', themeId: 12, officialId: 88, date: '2016-12-14', type: 'question', deputyId: deputyId }, { id: 108, title: 'work 108', themeId: 22, officialId: 108, date: '2016-09-12', type: 'report', deputyId: deputyId }]);
            // });
        }
        return workServiceStub;
    },

    buildDeclarationServiceStub: function() {
        let declarationServiceStub = function(){};
        declarationServiceStub.findDeclarationsForDeputy = function(deputyId) {
            return new Promise(function(resolve) {
                resolve([{ id: 11, title: 'Jolie decla', url: 'http://jolieurl', deputyId: '14', date: '22/12/2016' }, { id: 12, title: 'Jolie decla 2', url: 'http://jolieurl2', deputyId: '14', date: '13/01/2016' }]);
            });
        }
        return declarationServiceStub;
    },

    buildTimelineServiceStub: function() {
        let timelineServiceStub = function(){};
        timelineServiceStub.getTimeline = function(deputy, page) {
            return new Promise(function(resolve) {
                resolve([
                    {
                        'themeId': {
                            'id': 29,
                            'name': 'Travail',
                            'typeName': 'TRAVAIL'
                        },
                        'id': 34,
                        'officialId': '105',
                        'title': 'scrutin description',
                        'date': moment('2017-08-01'),
                        'dateDetailed': 'Première séance du 01/08/2017',
                        'type': 'SOR',
                        'totalVotes': '302',
                        'yesVotes': '36',
                        'noVotes': '256',
                        'isAdopted': false,
                        'analysisUrl': 'http://www2.assemblee-nationale.fr//scrutins/detail/(legislature)/15/(num)/105',
                        'fileUrl': 'http://www.assemblee-nationale.fr/15/dossiers/habilitation_ordonnances_dialogue_social.asp',
                        'createdAt': '2017-10-10T19:14:28.000Z',
                        'updatedAt': '2017-10-10T22:00:18.000Z',
                        'nonVoting': 1,
                        'deputyVote': 'missing'
                    }
                ])
            });
        }
        return timelineServiceStub;
    },

    buildClassWithStubs: function(classPathFromApi, stubs) {
        return proxyquire('../../api/' + classPathFromApi, stubs);
    }
}

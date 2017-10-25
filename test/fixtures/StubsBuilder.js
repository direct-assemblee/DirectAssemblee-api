let proxyquire = require('proxyquire');
let moment = require('moment')

let buildDeputy = function(isValid, hasCurrentMandate, departmentId, district, officialId) {
    let deputy;
    if (isValid) {
        let birthDate = moment().subtract(20, 'year');
        deputy = {
            officialId: officialId ? officialId : '14',
            departmentId: departmentId ? departmentId : 1,
            district: district ? district : 1,
            seatNumber: 44,
            birthDate: birthDate,
            firstname: 'JM',
            lastname: 'Député',
            parliamentGroup: 'FI'
        };
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

    buildGeolocServiceStub: function(number) {
        let geolocServiceStub = function(){};
        geolocServiceStub.getDistricts = function() {
            return new Promise(function(resolve) {
                let districts = [];
                if (number > 0) {
                    districts.push({ department: 34, district: 6 });
                }
                if (number > 1) {
                    districts.push({ department: 32, district: 5 });
                }
                resolve(districts);
            })
        }
        return geolocServiceStub;
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
        deputyServiceStub.getDeputyForGeoDistrict = function(departementId, district) {
            return new Promise(function(resolve) {
                resolve(buildDeputy(isValid, hasCurrentMandate, departementId, district));
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
        departmentServiceStub.findDepartmentWithCode = function(departmentCode) {
            return new Promise(function(resolve) {
                resolve({ id: 12, code: departmentCode, name: 'fakeDepartment' });
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

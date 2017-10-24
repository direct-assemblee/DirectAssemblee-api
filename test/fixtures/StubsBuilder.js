let proxyquire = require('proxyquire');
let moment = require('moment')

module.exports = {
    buildDateHelperStub: function() {
        let dateHelperStub = function(){};
        dateHelperStub.getFormattedNow = function() {
            return '2017-10-10';
        }
        return dateHelperStub;
    },

    buildDeputyServiceStub: function(returnValid) {
        let deputyServiceStub = function(){};
        deputyServiceStub.findMostRecentDeputyAtDate = function(departmentId, district, formattedNow) {
            return new Promise(function(resolve) {
                if (returnValid) {
                    var birthDate = moment().subtract(20, 'year');
                    resolve({ officialId: 14, departmentId: 1, district: 1, currentMandateStartDate: '18/06/2016', seatNumber: 44, birthDate: birthDate });
                } else {
                    resolve(undefined);
                }
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

    buildClassWithStubs: function(classPathFromApi, stubs) {
        return proxyquire('../../api/' + classPathFromApi, stubs);
    }
}

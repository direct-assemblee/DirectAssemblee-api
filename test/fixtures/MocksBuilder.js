let moment = require('moment')

let self = module.exports = {
    buildDeputy: function(isValid, hasCurrentMandate, departmentId, district, officialId, parliamentGroup, activityRate) {
        let deputy;
        if (isValid) {
            let birthDate = moment().subtract(20, 'year').format('YYYY-MM-DD');
            deputy = {
                officialId: officialId ? officialId : '14',
                departmentId: departmentId ? departmentId : 1,
                district: district ? district : 1,
                seatNumber: 44,
                birthDate: birthDate,
                firstname: 'JM',
                lastname: 'Député',
                parliamentGroup: parliamentGroup,
                activityRate: activityRate ? activityRate : 40.2
            };

            if (hasCurrentMandate) {
                deputy.currentMandateStartDate = '2016-06-18';
                deputy.mandateEndDate = '';
            } else {
                deputy.mandateEndDate = '2016-06-18';
                deputy.currentMandateStartDate = '';
            }
        }
        return deputy;
    },

    buildGroupedDeputies: function() {
        let deputiesGroup1 = []
        let deputiesGroup2 = []
        var nonGroupedDeputies = []
        deputiesGroup1.push(self.buildDeputy(true, true, 1, 1, 72001, 1, 15))
        deputiesGroup1.push(self.buildDeputy(true, true, 1, 5, 72004, 1, 20))
        deputiesGroup1.push(self.buildDeputy(true, true, 3, 1, 72005, 1, 10))
        deputiesGroup2.push(self.buildDeputy(true, true, 2, 1, 72002, 2, 10))
        deputiesGroup2.push(self.buildDeputy(true, true, 1, 3, 72003, 2, 30))
        nonGroupedDeputies.push(self.buildDeputy(true, true, 30, 3, 72006, 0, 5))
        let result = new Map()
        result.set(0, {
            group: {
                id: 0,
                name: 'Non-inscrits'
            },
            deputies: nonGroupedDeputies
        })
        result.set(1, {
            group: {
                id: 1,
                name: 'La REM'
            },
            deputies: deputiesGroup1
        })
        result.set(2, {
            group: {
                id: 2,
                name: 'La FI'
            },
            deputies: deputiesGroup2
        })
        return result
    },

    buildBallot: function(id, officialId, title, date) {
        return { id: id, officialId: officialId, title: title, date: date };
    },

    buildBallots: function(count, date) {
        let items = [];
        for (let i = 0 ; i < count ; i++) {
            let id = 33+i;
            items.push(self.buildBallot(id, id, 'ballot title ' + id, date));
        }
        return items;
    },

    buildWork: function(id, title, theme, officialId, date, type, deputyId) {
        return { id: id, title: title, theme: theme, officialId: officialId, date: date, type: type, deputyId: deputyId }
    },

    buildWorks: function(count, deputyId) {
        let items = [];
        if (count > 0) {
            items.push(self.buildWork(88, 'work 88', 12, 88, '2016-12-14', 'question', deputyId));
        }
        if (count > 1) {
            items.push(self.buildWork(108, 'work 108', 22, 108, '2016-09-12', 'report', deputyId));
        }
        if (count > 2) {
            items.push(self.buildWork(11, 'work 11', 1, 11, '2016-01-14', 'question', deputyId));
        }
        if (count > 3) {
            items.push(self.buildWork(54, 'work 54', 1, 54, '2016-12-14', 'commission', deputyId));
        }
        return items;
    }
}

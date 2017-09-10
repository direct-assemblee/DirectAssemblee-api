require('../../bootstrap');

var createdId;

beforeEach(function(done) {
    Department.create({ code: '3' })
    .then(function() {
        DepartmentService.findDepartmentWithCode('3')
        .then(function(department) {
            createdId = department.id;
        })
        done();
    })
});

describe('The DepartmentService', function () {
    it('should return department with given code', function(done) {
        DepartmentService.findDepartmentWithCode('3')
        .then(function(department) {
            department.code.should.equal('3')
            done();
        })
        .catch(done);
    });

    it('should return department with given id', function(done) {
        DepartmentService.findDepartmentWithId(createdId)
        .then(function(department) {
            department.id.should.equal(createdId)
            done();
        })
        .catch(done);
    });
});

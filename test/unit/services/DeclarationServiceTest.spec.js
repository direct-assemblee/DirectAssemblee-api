require('../../bootstrap');

var createdId;

describe('The DeclarationService', function () {
    beforeEach(function(done) {
        let promises = [];
        promises.push(Declaration.create({ deputyId: 3, date: '2016-12-22' }))
        promises.push(Declaration.create({ deputyId: 3, date: '2016-01-13' }))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return cleaned declarations for deputy', function(done) {
        DeclarationService.getDeclarationsForDeputy('3')
        .then(function(declarations) {
            declarations.length.should.equal(2);
            declarations[0].date.should.equal('22/12/2016');
            should.not.exist(declarations[0].createdId);
            should.not.exist(declarations[0].updatedAt);
            should.not.exist(declarations[0].id);
            should.not.exist(declarations[0].deputyId);
            declarations[1].date.should.equal('13/01/2016');
            should.not.exist(declarations[1].deputyId);
            should.not.exist(declarations[1].createdId);
            should.not.exist(declarations[1].updatedAt);
            should.not.exist(declarations[1].id);
            done();
        })
        .catch(done);
    });

    it('should return no declaration for deputy', function(done) {
        DeclarationService.getDeclarationsForDeputy('4')
        .then(function(declarations) {
            declarations.length.should.equal(0);
            done();
        })
        .catch(done);
    });
});

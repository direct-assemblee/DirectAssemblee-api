require('../../bootstrap.test');

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

    after(function(done) {
        let promises = [];
        promises.push(Declaration.destroy({}))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return no declaration for deputy', function(done) {
        DeclarationService.findDeclarationsForDeputy('4')
        .then(function(declarations) {
            declarations.length.should.equal(0);
            done();
        })
        .catch(done);
    });
});

require('../../../bootstrap.test');
let DeputyResponseHelper = require('../../../../api/controllers/helpers/DeputyResponseHelper.js')

describe('The DeputyResponseHelper', function () {
    describe('prepares declarations', function () {
        before(function(done) {
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

        it('should return cleaned declarations', function(done) {
            Declaration.find()
            .then(function(declarations) {
                let cleanedDeclarations = DeputyResponseHelper.prepareDeclarationsResponse(declarations)
                cleanedDeclarations.length.should.equal(2);
                cleanedDeclarations[0].date.should.equal('22/12/2016');
                should.not.exist(cleanedDeclarations[0].createdId);
                should.not.exist(cleanedDeclarations[0].updatedAt);
                should.not.exist(cleanedDeclarations[0].id);
                should.not.exist(cleanedDeclarations[0].deputyId);
                cleanedDeclarations[1].date.should.equal('13/01/2016');
                should.not.exist(cleanedDeclarations[1].deputyId);
                should.not.exist(cleanedDeclarations[1].createdId);
                should.not.exist(cleanedDeclarations[1].updatedAt);
                should.not.exist(cleanedDeclarations[1].id);
                done();
            })
            .catch(done);
        });
    });
});

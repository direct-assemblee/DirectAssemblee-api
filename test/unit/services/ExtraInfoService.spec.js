require('../../bootstrap');

let Promise = require('bluebird');

describe('The ExtraInfoService', function () {
    before(function(done) {
        let promises = [];
        promises.push(ExtraInfo.create({ info: 'an info', value: 'a value', workId: 3 }));
        promises.push(ExtraInfo.create({ info: 'another info', value: 'another value', workId: 3 }));
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    after(function(done) {
        let promises = [];
        promises.push(ExtraInfo.destroy())
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return correct extraInfo', function(done) {
        ExtraInfoService.findExtraInfosForWork(3)
        .then(function(extraInfos) {
            should.exist(extraInfos);
            extraInfos.length.should.equal(2);
            should.exist(extraInfos[0].id);
            extraInfos[0].info.should.equal('an info');
            extraInfos[0].value.should.equal('a value');
            should.exist(extraInfos[1].id);
            extraInfos[1].info.should.equal('another info');
            extraInfos[1].value.should.equal('another value');
            done();
        })
        .catch(done);
    });

    it('should return no extraInfo', function(done) {
        ExtraInfoService.findExtraInfosForWork(4)
        .then(function(extraInfos) {
            should.exist(extraInfos);
            extraInfos.length.should.equal(0);
            done();
        })
        .catch(done);
    });
});

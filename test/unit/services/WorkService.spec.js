require('../../bootstrap.test');
let moment = require('moment');

let Promise = require('bluebird');

let createTheme = function() {
    let promises = [];
    promises.push(Theme.create({ name: 'themeName', typeName: 'themeTypeName' }))
    return Promise.all(promises)
    .then(function() {
        return Theme.findOne({ name: 'themeName' })
        .then(function(theme) {
            return theme.id;
        })
    })
}

let createWorks = function(createdThemeId) {
    let promises = [];
    promises.push(Work.create({ title: 'another title before', themeId: createdThemeId, date: '2014-08-13', url: 'http://titi', description: 'another description', type: 'commission', deputyId: 33 }));
    promises.push(Work.create({ title: 'another title', themeId: createdThemeId, date: '2014-08-14', url: 'http://toto', description: 'another description', type: 'question', deputyId: 33 }));
    promises.push(Work.create({ title: 'another title after', themeId: createdThemeId, date: '2014-08-15', url: 'http://toto', description: 'another description', type: 'commission', deputyId: 33 }));

    promises.push(Work.create({ title: 'very old title', themeId: createdThemeId, date: '2004-08-14', url: 'http://toto', description: 'very old description', type: 'commission', deputyId: 33 }));
    return Promise.all(promises)
    .then(function() {
        return Work.findOne({ url: 'http://titi' });
    })
}

describe('The WorkService', function () {
    before(function(done) {
        createTheme()
        .then(function(createdThemeId) {
            return createWorks(createdThemeId)
            .then(function(firstCreatedWork) {
                return ExtraInfo.create({ info: 'an info', value: 'a value', workId: firstCreatedWork.id });
            })
            .then(function() {
                done();
            })
        })
    });

    after(function(done) {
        let promises = [];
        promises.push(Work.destroy({}))
        Promise.all(promises)
        .then(function() {
            done();
        })
    });

    it('should return works with theme for deputy from given date', function(done) {
        WorkService.findWorksWithThemeForDeputyAfterDate(33, '2014-08-14')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(2);

            should.exist(works[0].date);
            moment(works[0].date).format('YYYY-MM-DD').should.equal('2014-08-14');
            works[0].title.should.equal('another title');
            works[0].themeId.name.should.equal('themeName');

            should.exist(works[1].date);
            moment(works[1].date).format('YYYY-MM-DD').should.equal('2014-08-15');
            works[1].title.should.equal('another title after');
            works[1].themeId.name.should.equal('themeName');
            done();
        })
        .catch(done);
    });

    it('should return no work for deputy from given date too recent date', function(done) {
        WorkService.findWorksWithThemeForDeputyAfterDate(33, '2017-01-01')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(0);
            done();
        })
        .catch(done);
    });

    it('should return no work for deputy from given date - wrong deputy', function(done) {
        WorkService.findWorksWithThemeForDeputyAfterDate(3, '2014-08-14')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(0);
            done();
        })
        .catch(done);
    });

    it('should return work dates for deputy from given date', function(done) {
        WorkService.findWorksDatesForDeputyAfterDate(33, '2014-08-14')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(2);
            works[0].should.equal('2014-08-14');
            works[1].should.equal('2014-08-15');
            done();
        })
        .catch(done);
    });

    it('should return no work dates for deputy from given date too recent date', function(done) {
        WorkService.findWorksDatesForDeputyAfterDate(33, '2017-01-01')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(0);
            done();
        })
        .catch(done);
    });

    it('should return no works date for deputy from given date - wrong deputy', function(done) {
        WorkService.findWorksDatesForDeputyAfterDate(3, '2014-01-01')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(0);
            done();
        })
        .catch(done);
    });

    it('should return complete works for timeline for deputy between dates', function(done) {
        WorkService.findWorksForDeputyBetweenDates(33, '2013-08-14', '2014-08-14')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(2);

            works[0].date.should.equal('2014-08-13');
            works[0].title.should.equal('another title before');
            should.not.exist(works[0].theme);
            works[0].type.should.equal('commission');
            works[0].url.should.equal('http://titi');
            works[0].description.should.equal('another description');

            should.exist(works[0].extraInfos);
            works[0].extraInfos.length.should.equal(1);
            works[0].extraInfos[0].info.should.equal('an info');
            works[0].extraInfos[0].value.should.equal('a value');

            works[1].date.should.equal('2014-08-14');
            works[1].title.should.equal('another title');
            should.exist(works[1].themeId);
            works[1].themeId.typeName.should.equal('themeTypeName');
            works[1].themeId.name.should.equal('themeName');
            works[1].themeId.id.should.be.above(0);
            works[1].type.should.equal('question');
            works[1].url.should.equal('http://toto');
            works[1].description.should.equal('another description');

            should.exist(works[1].extraInfos);
            works[1].extraInfos.length.should.equal(0);
            done();
        })
        .catch(done);
    });

    it('should return no work dates for deputy from given date too recent date', function(done) {
        WorkService.findWorksForDeputyBetweenDates(33, '2017-01-01', '2017-08-14')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(0);
            done();
        })
        .catch(done);
    });

    it('should return no works date for deputy from given date - wrong deputy', function(done) {
        WorkService.findWorksForDeputyBetweenDates(3, '2013-08-14', '2014-08-14')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(0);
            done();
        })
        .catch(done);
    });
});

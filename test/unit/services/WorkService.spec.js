require('../../bootstrap.test');
let moment = require('moment');
let Promise = require('bluebird');

let StubsBuilder = require('../../fixtures/StubsBuilder');
let WorkService;

let createTheme = function() {
    let promises = [];
    promises.push(Deputy.create({ officialId: 33, departmentId: 1, district: 1, currentMandateStartDate: '2014-06-18', mandateEndDate: '' }))
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
    promises.push(WorkType.create({ id: 1, displayName: 'Question', name: 'question', officialPath: 'Questions' }));
    promises.push(WorkType.create({ id: 2, displayName: 'Rapport', name: 'report', officialPath: 'RapportsParlementaires' }));
    promises.push(addWork(33, 'another title before', null, '2014-08-13', 'http://titi', 'another description', 4));
    promises.push(addWork(33, 'another title', createdThemeId, '2014-08-14', 'http://toto', 'another description', 1));
    promises.push(addWork(33, 'another title after', createdThemeId, '2014-08-15', 'http://tata', 'another description', 2));
    promises.push(addWork(33, 'very old title', createdThemeId, '2004-08-14', 'http://tutu', 'very old description', 4));
    return Promise.all(promises)
    .then(function() {
        return Work.findOne({ url: 'http://titi' });
    })
}

let addWork = function(deputyId, title, theme, date, url, description, type) {
    return Work.create({ createdAt: date, title: title, theme: theme, date: date, url: url, description: description, type: type })
    .meta({ fetch: true })
    .then(function(insertedWork) {
        return Deputy.addToCollection(deputyId, 'workCreations')
        .members(insertedWork.id)
        .catch(err => {
            console.log('-- Error adding creation ' + err);
            return
        });
    })
}

describe('The WorkService', function () {
    before(function(done) {
        let stubs = {
            './helpers/DateHelper.js': StubsBuilder.buildDateHelperStub()
        }
        WorkService = StubsBuilder.buildStub('services/WorkService', stubs);
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

    it('should return last created works for deputy after date date', function(done) {
        WorkService.findLastWorksToPushForDeputy(33, '2014-08-14')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(2);

            if (works[0].title === 'another title') {
                checkWork(works[0], '2014-08-14', 'another title', 1)
                checkWork(works[1], '2014-08-15', 'another title after', 2)
            } else {
                checkWork(works[1], '2014-08-14', 'another title', 1)
                checkWork(works[0], '2014-08-15', 'another title after', 2)
            }
            done();
        })
        .catch(done);
    });

    it('should return no work for deputy from given date too recent date', function(done) {
        WorkService.findLastWorksToPushForDeputy(33, '2017-01-01')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(0);
            done();
        })
        .catch(done);
    });

    it('should return no work for deputy from given date - wrong deputy', function(done) {
        WorkService.findLastWorksToPushForDeputy(3, '2014-08-14')
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
            should.exist(works[0].type);
            works[0].type.should.equal(4);
            works[0].url.should.equal('http://titi');
            works[0].description.should.equal('another description');

            works[1].date.should.equal('2014-08-14');
            works[1].title.should.equal('another title');
            should.exist(works[1].theme);
            should.exist(works[1].type);
            works[1].type.should.equal(1);
            works[1].url.should.equal('http://toto');
            works[1].description.should.equal('another description');

            done();
        })
        .catch(done);
    });

    it('should return no work for deputy between dates - too recent dates', function(done) {
        WorkService.findWorksForDeputyBetweenDates(33, '2017-01-01', '2017-08-14')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(0);
            done();
        })
        .catch(done);
    });

    it('should return no works for deputy between dates - wrong deputy', function(done) {
        WorkService.findWorksForDeputyBetweenDates(1222, '2013-08-14', '2014-08-14')
        .then(function(works) {
            should.exist(works);
            works.length.should.equal(0);
            done();
        })
        .catch(done);
    });
});

let checkWork = function(work, date, title, theme) {
    should.exist(work.date);
    moment(work.date).format('YYYY-MM-DD').should.equal(date);
    work.title.should.equal(title);
    should.exist(work.theme);
}

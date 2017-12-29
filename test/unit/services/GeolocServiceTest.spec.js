require('../../bootstrap.test');

let StubsBuilder = require('../../fixtures/StubsBuilder');
let RequestServiceStubs = require('../../fixtures/RequestServiceStubs')

let GeolocService;

describe('The GeolocService', function () {
    describe('retrieves single district coordinates', function () {
        before(function() {
            let stubs = {
                './RequestService': RequestServiceStubs.buildRequestServiceStub(['34_2', '34_2', '34_2', '34_2', '34_2'])
            }
            GeolocService = StubsBuilder.buildStub('services/GeolocService', stubs);
        });

        it('should return single district', function(done) {
            GeolocService.getDistricts(43.610389, 3.876520)
            .then(function(districts) {
                districts.length.should.equal(1);
                districts[0].department.should.equal(34);
                districts[0].district.should.equal(2);
                done();
            })
            .catch(done);
        });
    });

    describe('retrieves multiple districts coordinates', function () {
        before(function() {
            let stubs = {
                './RequestService': RequestServiceStubs.buildRequestServiceStub(['34_8', '34_8', '34_3', '34_8', '34_8'])
            }
            GeolocService = StubsBuilder.buildStub('services/GeolocService', stubs);
        });

        it('should return 2 districts', function(done) {
            GeolocService.getDistricts(43.613494, 3.874250)
            .then(function(districts) {
                districts.length.should.equal(2);
                districts[0].department.should.equal(34);
                districts[0].district.should.equal(8);
                districts[1].department.should.equal(34);
                districts[1].district.should.equal(2);
                done();
            })
            .catch(done);
        });
    });
});

require('../../bootstrap.test');

let StubsBuilder = require('../../fixtures/StubsBuilder');
let MocksBuilder = require('../../fixtures/MocksBuilder');

describe('The PushNotifService', function() {
    describe('getPayloadValuesForDailyVotes()', function() {
        it('should return one vote', function(done) {
            let votes = [ { value: 'for', theme: 'example'} ]
            let payload = PushNotifService.getPayloadValuesForDailyVotes(votes);
            should.exist(payload)
            payload.counts.for.should.equal(1)
            payload.value.should.equal('for')
            payload.theme.should.equal('example')
            done()
        }),

        it('should return three votes with same value', function(done) {
            let votes = [
                { value: 'for', theme: 'example'},
                { value: 'for', theme: 'bip'},
                { value: 'for', theme: 'example'}
            ]
            let payload = PushNotifService.getPayloadValuesForDailyVotes(votes);
            should.exist(payload)
            payload.counts.for.should.equal(3)
            payload.value.should.equal('for')
            should.not.exist(payload.theme)
            done()
        }),

        it('should return two votes with same theme', function(done) {
            let votes = [
                { value: 'for', theme: 'bip'},
                { value: 'against', theme: 'bip'},
                { value: 'non-voting', theme: 'bip'},
                { value: 'for', theme: 'bip'}
            ]
            let payload = PushNotifService.getPayloadValuesForDailyVotes(votes);
            should.exist(payload)
            payload.counts.for.should.equal(2)
            payload.counts.against.should.equal(1)
            payload.counts.nonVoting.should.equal(1)
            payload.theme.should.equal('bip')
            should.not.exist(payload.value)
            done()
        })
    })
});

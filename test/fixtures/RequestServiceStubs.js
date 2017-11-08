module.exports = {
    buildRequestServiceStub: function(jsonBodyFilenameArray) {
        let count = 0;
        let requestServiceStub = function(){};
        requestServiceStub.callGeocoding = function(provider, latitude, longitude) {
            return new Promise(function(resolve) {
                let response = JSON.stringify(require('../geocoding/'+ jsonBodyFilenameArray[count] + '.json'));
                count++;
                resolve(response);
            });
        }
        return requestServiceStub;
    }
}

let Request = require('request-promise');

const PARAM_LATITUDE = '{latitude}';
const PARAM_LONGITUDE = '{longitude}';
const GMAP_API_KEY = 'AIzaSyCwHl1AXUzENiz_VsABqZ8QIAHO5C-K8Js';

const PROVIDER_GMAP = { name: 'PROVIDER_GMAP', url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + PARAM_LATITUDE + ',' + PARAM_LONGITUDE + '&key=' + GMAP_API_KEY };
const PROVIDER_GOUV = { name: 'PROVIDER_GOUV', url: 'http://api-adresse.data.gouv.fr/reverse/?lon=' + PARAM_LONGITUDE + '&lat=' + PARAM_LATITUDE };

module.exports = {
    PROVIDER_GMAP: PROVIDER_GMAP,
    PROVIDER_GOUV: PROVIDER_GOUV,

    callGeocoding: function(provider, latitude, longitude) {
        return callGeocoding(provider.url, latitude, longitude);
    }
}

let callGeocoding = function(geocodingUrl, latitude, longitude) {
    let url = geocodingUrl.replace(PARAM_LATITUDE, latitude).replace(PARAM_LONGITUDE, longitude);
    console.log(url)
    return Request(url)
    .then(function(response) {
        return response;
    })
    .catch(function(err) {
        console.log(err);
    });
}

var Promise = require("bluebird");
var request = require('request');
var fs = require('fs');
var Turf = require('@turf/turf');

const PARAM_LATITUDE = "{latitude}"
const PARAM_LONGITUDE = "{longitude}"
const GMAP_API_KEY = "AIzaSyAvsIi1QfYiWr1HPR1vZ-AeZBbcffl5y2s"
const GMAP_REVERSE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + PARAM_LATITUDE + "," + PARAM_LONGITUDE + "&key=" + GMAP_API_KEY

var self = module.exports = {
  getAddress: function(latitude, longitude) {
    return new Promise(function(resolve, reject) {
      var url = GMAP_REVERSE_GEOCODING_URL.replace(PARAM_LATITUDE, latitude).replace(PARAM_LONGITUDE, longitude)
      request(url, function(error, response, body) {
        var circonscriptions = {};
        if (!error && response.statusCode == 200) {
          var json = JSON.parse(body);
          if (json.results && json.results.length > 0) {
            var addressComponents = json.results[0].address_components;
            circonscriptions = findCirconscriptions(addressComponents, latitude, longitude);
          }
        }
        resolve(circonscriptions);
      });
    })
  }
}

var findCirconscriptions = function(addressComponents, latitude, longitude) {
  return reverseGeocode(latitude, longitude)
  .then(function(targetCityAndCode) {
    var targetDepartment = parseInt(targetCityAndCode.postalCode / 1000);
    var extraCoords = [
      [ latitude, longitude - (2 * (0.1 / 111.11 * Math.cos(latitude))) ],
      [ latitude, parseFloat(longitude) + (2 * (0.1 / 111.11 * Math.cos(latitude))) ],
      [ parseFloat(latitude) + (2 * 0.0009), longitude ],
      [ latitude - (2 * 0.0009), longitude ]
    ];

    var promises = []
    for (i in extraCoords) {
      promises.push(reverseGeocode(extraCoords[i][0], extraCoords[i][1]))
    }
    return Promise.all(promises)
    .then(function(citiesAndCodes) {
      return filterCirconscritptions(targetDepartment, citiesAndCodes, extraCoords);
    })
  })
}

var reverseGeocode = function (latitude, longitude) {
  return new Promise(function(resolve, reject) {
    var url = GMAP_REVERSE_GEOCODING_URL.replace(PARAM_LATITUDE, latitude).replace(PARAM_LONGITUDE, longitude)
    request(url, function(error, response, body) {
      var cityAndCode;
      if (!error && response.statusCode == 200) {
        var json = JSON.parse(body);
        if (json.results && json.results.length > 0) {
          var addressComponents = json.results[0].address_components;
          cityAndCode = findCityAndCode(addressComponents);
        }
      }
      return resolve(cityAndCode);
    })
  })
}

var findCityAndCode = function(addressComponents) {
  var result = {};
  for (i in addressComponents) {
    var types = addressComponents[i].types;
    for (j in types) {
      if (types[j] === "locality") {
        result.locality = addressComponents[i].long_name;
      } else if (types[j] === "postal_code") {
        result.postalCode = addressComponents[i].long_name;
      }
    }
  }
  return result;
}

var filterCirconscritptions = function(targetDepartment, citiesAndCodes, extraCoords) {
  return Promise.filter(citiesAndCodes, function(cityAndCode) {
    return cityAndCode && targetDepartment === parseInt(cityAndCode.postalCode / 1000)
  })
  .then(function(foundCitiesAndCodes) {
    var circonscriptions = [];
    for (i in foundCitiesAndCodes) {
      var foundCirc = getCirconscriptionsForPoint(extraCoords[i][0], extraCoords[i][1]);
      circonscriptions = addUniqueCirconscriptions(foundCirc, circonscriptions);
    }
    return circonscriptions;
  })
}


var getCirconscriptionsForPoint = function(latitude, longitude) {
  var polygonsGeojson = fs.readFileSync('./assets/circonscriptions2010.geojson', "utf-8");
  var json = JSON.parse(polygonsGeojson);
  var point = [ parseFloat(longitude), parseFloat(latitude) ];
  var circonscriptions = [];
  for (i in json.features) {
    var circ = json.features[i];
    var coords = circ.geometry.coordinates;
    if (coords) {
      if (Turf.inside(Turf.point(point), Turf.polygon(coords))) {
        var code = circ.properties.name;
        circonscriptions.push({ department: parseInt(code / 1000), circonscriptionNumber : parseInt(code % 1000) });
      }
    }
  }
  return circonscriptions;
}

var addUniqueCirconscriptions = function(newCirc, allCirc) {
  for (j in newCirc) {
    if (allCirc.length === 0) {
      allCirc.push(newCirc[j]);
    } else {
      var add = true;
      for (k in allCirc) {
        if (allCirc[k].department === newCirc[j].department
            && allCirc[k].circonscriptionNumber === newCirc[j].circonscriptionNumber) {
          add = false;
          break;
        }
      }
      if (add) {
        allCirc.push(newCirc[j]);
      }
    }
  }
  return allCirc;
}

var Promise = require("bluebird");
var request = require('request');
var fs = require('fs');
var Turf = require('@turf/turf');

const PARAM_LATITUDE = "{latitude}"
const PARAM_LONGITUDE = "{longitude}"
const GMAP_API_KEY = "AIzaSyAvsIi1QfYiWr1HPR1vZ-AeZBbcffl5y2s"
const REVERSE_GEOCODING_URL = "http://api-adresse.data.gouv.fr/reverse/?lon=" + PARAM_LONGITUDE + "&lat=" + PARAM_LATITUDE
const GMAP_REVERSE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + PARAM_LATITUDE + "," + PARAM_LONGITUDE + "&key=" + GMAP_API_KEY

var self = module.exports = {
  getAddress: function(latitude, longitude) {
    return findDistricts(REVERSE_GEOCODING_URL, parseFloat(latitude), parseFloat(longitude))
    .then(function(districts) {
      if (!districts) {
        return findDistricts(GMAP_REVERSE_GEOCODING_URL, parseFloat(latitude), parseFloat(longitude))
      }
      return districts;
    })
  }
}

var findDistricts = function(geocodingUrl, latitude, longitude) {
  return reverseGeocode(geocodingUrl, latitude, longitude)
  .then(function(targetCityAndCode) {
    if (targetCityAndCode) {
      var targetDepartment = parseInt(targetCityAndCode.postalCode / 100);
      var multiple = 1;
      var extraCoords = [
        [ latitude, longitude - (multiple * (0.1 / 111.11 * Math.cos(latitude))) ], // 100m est
        [ latitude, longitude + (multiple * (0.1 / 111.11 * Math.cos(latitude))) ], // 100m ouest
        [ latitude + (multiple * 0.0009), longitude ], // 100m nord
        [ latitude - (multiple * 0.0009), longitude ]  // 100m sud
      ];

      var promises = []
      for (i in extraCoords) {
        promises.push(reverseGeocode(geocodingUrl, extraCoords[i][0], extraCoords[i][1]))
      }
      return Promise.all(promises)
      .then(function(citiesAndCodes) {
        return filterCirconscritptions(targetDepartment, citiesAndCodes, extraCoords);
      })
    } else {
      return;
    }
  })
}

var reverseGeocode = function(geocodingUrl, latitude, longitude) {
  return new Promise(function(resolve, reject) {
    var url = geocodingUrl.replace(PARAM_LATITUDE, latitude).replace(PARAM_LONGITUDE, longitude)
    request(url, function(error, response, body) {
      var cityAndCode;
      if (!error && response.statusCode == 200) {
        var json = JSON.parse(body);
        if (json.features) {
          if (json.features.length > 0) {
            var properties = json.features[0].properties
            cityAndCode = findCityAndCode(properties);
          }
        } else if (json.results && json.results.length > 0) {
          var addressComponents = json.results[0].address_components;
          cityAndCode = findCityAndCode(addressComponents);
        }
      }
      resolve(cityAndCode);
    })
  })
}

var findCityAndCode = function(addressComponents) {
  var result = {};
  if (addressComponents.postcode) {
    result.locality = addressComponents.city;
    result.postalCode = addressComponents.postcode;
  } else {
    for (i in addressComponents) {
      var types = addressComponents[i].types;
      for (j in types) {
        if (types[j] === "locality") {
          result.locality = addressComponents[i].long_name;
        } else if (types[j] === "postal_code") {
          result.postalCode = addressComponents[i].long_name;
        } else if (types[j] === "country") {
          result.postalCode = findPostalCodeFromCountry(addressComponents[i].short_name);
        }
      }
    }
  }
  return result;
}

var findPostalCodeFromCountry = function(country) {
  switch(country) {
    case "PF": // polynesie francaise
      return 98700;
    case "NC": // nouvelle caledonie
      return 98800;
    case "WF": // wallis et futuna
      return 98600;
    case "BL": // saint barthelemy - fake code (guadeloupe)
      return 97700;
    case "MF": // saint martin - fake code (guadeloupe)
      return 97700;
    case "PM": // saint pierre et miquelon
      return 97500;
    case "YT": // mayotte (ok)
      return 97600;
    case "GP": // guadeloupe (ok)
      return 97100;
    case "RE": // réunion (mi-ok)
      return 97400;
    case "GF": // guyane
      return 97300;
    case "MQ": // martinique (mi-ok)
      return 97200;
  }
}

var filterCirconscritptions = function(targetDepartment, citiesAndCodes, extraCoords) {
  return Promise.filter(citiesAndCodes, function(cityAndCode) {
    return cityAndCode && targetDepartment === parseInt(cityAndCode.postalCode / 100)
  })
  .then(function(foundCitiesAndCodes) {
    var districts = [];
    for (i in foundCitiesAndCodes) {
      var foundCirc = getDistrictsForPoint(extraCoords[i][0], extraCoords[i][1]);
      districts = addUniqueDistricts(foundCirc, districts);
    }
    return districts;
  })
}

var getDistrictsForPoint = function(latitude, longitude) {
  var polygonsGeojson = fs.readFileSync('./assets/simplified_circonscriptions.json', "utf-8");
  var json = JSON.parse(polygonsGeojson);
  var point = [ parseFloat(longitude), parseFloat(latitude) ];
  var districts = [];
  for (i in json.features) {
    var circ = json.features[i];
    var type = circ.geometry.type;
    var coords = circ.geometry.coordinates;
    if (coords) {
      var polygon = type === "Polygon" ? Turf.polygon(coords) : Turf.multiPolygon(coords);
      if (Turf.inside(Turf.point(point), polygon)) {
        var area = circ.properties.REF.split('-')
        var code = area[0].startsWith('0') ? parseInt(area[0], 10) : area[0];
        if (code == 978) {
          code = 977; // make saint-martin be same as saint-barth
        }
        var district = area[1].startsWith('0') ?  parseInt(area[1], 10) : area[1];
        districts.push({ department: code, district : district });
      }
    }
  }
  return districts;
}

var addUniqueDistricts = function(newCirc, allCirc) {
  for (j in newCirc) {
    if (allCirc.length === 0) {
      allCirc.push(newCirc[j]);
    } else {
      var add = true;
      for (k in allCirc) {
        if (allCirc[k].department === newCirc[j].department
            && allCirc[k].district === newCirc[j].district) {
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

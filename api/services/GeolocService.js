let Promise = require('bluebird');
let RequestService = require('./RequestService');
let fs = require('fs');
let Turf = require('@turf/turf');


module.exports = {
    getDistricts: function(latitude, longitude) {
        return findDistricts(RequestService.PROVIDER_GOUV, parseFloat(latitude), parseFloat(longitude))
        .then(function(districts) {
            if (!districts) {
                return findDistricts(RequestService.PROVIDER_GMAP, parseFloat(latitude), parseFloat(longitude));
            }
            return districts;
        })
    }
}

let findDistricts = function(provider, latitude, longitude) {
    return reverseGeocode(provider, latitude, longitude)
    .then(function(targetCityAndCode) {
        if (targetCityAndCode) {
            let targetDepartment = parseInt(targetCityAndCode.postalCode / 100);
            let multiple = 1;
            let extraCoords = [
                [ latitude, longitude - (multiple * (0.1 / 111.11 * Math.cos(latitude))) ], // 100m est
                [ latitude, longitude + (multiple * (0.1 / 111.11 * Math.cos(latitude))) ], // 100m ouest
                [ latitude + (multiple * 0.0009), longitude ], // 100m nord
                [ latitude - (multiple * 0.0009), longitude ]  // 100m sud
            ];

            let promises = []
            for (let i in extraCoords) {
                promises.push(reverseGeocode(provider, extraCoords[i][0], extraCoords[i][1]))
            }
            return Promise.all(promises)
            .then(function(citiesAndCodes) {
                return filterCirconscritptions(targetDepartment, citiesAndCodes, extraCoords);
            })
        }
    })
}

let reverseGeocode = function(provider, latitude, longitude) {
    return RequestService.callGeocoding(provider, latitude, longitude)
    .then(function(response) {
        if (response) {
            let cityAndCode;
            let json = JSON.parse(response);
            if (json.features) {
                if (json.features.length > 0) {
                    let properties = json.features[0].properties
                    cityAndCode = findCityAndCode(properties);
                }
            } else if (json.results && json.results.length > 0) {
                let addressComponents = json.results[0].address_components;
                cityAndCode = findCityAndCode(addressComponents);
            }
            return cityAndCode;
        }
    })
}

let findCityAndCode = function(addressComponents) {
    let result = {};
    if (addressComponents.postcode) {
        result.locality = addressComponents.city;
        result.postalCode = addressComponents.postcode;
    } else {
        for (let i in addressComponents) {
            let types = addressComponents[i].types;
            for (let j in types) {
                if (types[j] === 'locality') {
                    result.locality = addressComponents[i].long_name;
                } else if (types[j] === 'postal_code') {
                    result.postalCode = addressComponents[i].long_name;
                } else if (types[j] === 'country') {
                    result.postalCode = findPostalCodeFromCountry(addressComponents[i].short_name);
                }
            }
        }
    }
    return result;
}

let findPostalCodeFromCountry = function(country) {
    switch(country) {
        case 'PF': // polynesie francaise
        return 98700;
        case 'NC': // nouvelle caledonie
        return 98800;
        case 'WF': // wallis et futuna
        return 98600;
        case 'BL': // saint barthelemy - fake code (guadeloupe)
        return 97700;
        case 'MF': // saint martin - fake code (guadeloupe)
        return 97700;
        case 'PM': // saint pierre et miquelon
        return 97500;
        case 'YT': // mayotte (ok)
        return 97600;
        case 'GP': // guadeloupe (ok)
        return 97100;
        case 'RE': // réunion (mi-ok)
        return 97400;
        case 'GF': // guyane
        return 97300;
        case 'MQ': // martinique (mi-ok)
        return 97200;
    }
}

let filterCirconscritptions = function(targetDepartment, citiesAndCodes, extraCoords) {
    return Promise.filter(citiesAndCodes, function(cityAndCode) {
        return cityAndCode && targetDepartment === parseInt(cityAndCode.postalCode / 100)
    })
    .then(function(foundCitiesAndCodes) {
        let districts = [];
        for (let i in foundCitiesAndCodes) {
            let foundCirc = getDistrictsForPoint(extraCoords[i][0], extraCoords[i][1]);
            districts = addUniqueDistricts(foundCirc, districts);
        }
        return districts;
    })
}

let getDistrictsForPoint = function(latitude, longitude) {
    let polygonsGeojson = fs.readFileSync('./assets/simplified_circonscriptions.json', 'utf-8');
    let json = JSON.parse(polygonsGeojson);
    let point = [ parseFloat(longitude), parseFloat(latitude) ];
    let districts = [];
    for (let i in json.features) {
        let circ = json.features[i];
        let type = circ.geometry.type;
        let coords = circ.geometry.coordinates;
        if (coords) {
            let polygon = type === 'Polygon' ? Turf.polygon(coords) : Turf.multiPolygon(coords);
            if (Turf.inside(Turf.point(point), polygon)) {
                let area = circ.properties.REF.split('-')
                let code = area[0].startsWith('0') ? parseInt(area[0], 10) : area[0];
                if (code == 978) {
                    code = 977; // make saint-martin be same as saint-barth
                }
                let district = area[1].startsWith('0') ?  parseInt(area[1], 10) : area[1];
                districts.push({ department: code, district : district });
            }
        }
    }
    return districts;
}

let addUniqueDistricts = function(newCirc, allCirc) {
    for (let j in newCirc) {
        if (allCirc.length === 0) {
            allCirc.push(newCirc[j]);
        } else {
            let add = true;
            for (let k in allCirc) {
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

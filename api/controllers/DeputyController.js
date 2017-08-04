const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')
var DateHelper = require('../services/helpers/DateHelper.js')

var self = module.exports = {
    getDeputies: function(req, res) {
        if (req.param('latitude') || req.param('longitude')) {
            return getDeputiesWithCoordinates(req, res)
        } else {
            return res.json(400, 'Must provide latitude and longitude arguments')
        }
    },

    getDeputy: function(req, res) {
        var departmentId = req.param('departmentId')
        var district = req.param('district')
        if (departmentId && district) {
            return DeputyService.findDeputiesForDistrict(departmentId, district, false)
                .then(function(deputies) {
                    if (deputies && deputies.length > 0) {
                        deputies.sort(function(a, b) {
                            var diff = DateHelper.getDiff(b.currentMandateStartDate, a.currentMandateStartDate)
                            return diff < 0 ? -1 : 1
                        })
                        var mostRecentDeputy = deputies[0]
                        if (mostRecentDeputy.currentMandateStartDate) {
                            return getDeputyWithId(deputies[0].officialId, res)
                        } else {
                            return res.json(404, 'Found deputy, but mandate has ended.')
                        }
                    } else {
                        return res.json(404, 'Could not find deputy, sorry.')
                    }
                })
        } else {
            return res.json(400, 'Must provide departmentId and district arguments')
        }
    }
}

var getDeputiesWithCoordinates = function(req, res) {
    return GeolocService.getAddress(req.param('latitude'), req.param('longitude'))
        .then(function(districts) {
            if (districts && districts.length > 0) {
                var deputies = []
                for (i in districts) {
                    deputies.push(DeputyService.getDeputyForGeoDistrict(districts[i]))
                }
                return Promise.all(deputies)
                    .then(function(deputies) {
                        var deputiesArray = []
                        for (i in deputies) {
                            for (j in deputies[i]) {
                                deputiesArray.push(deputies[i][j])
                            }
                        }
                        return res.json(deputiesArray)
                    })
            } else {
                return res.json(404, 'Sorry, no district found')
            }
        })
}

var getDeputyWithId = function(id, res) {
    return DeputyService.findDeputyWithIdAndFormat(id)
        .then(function(deputy) {
            if (!deputy) {
                return res.json(404, 'Could not find deputy, sorry.')
            }
            return res.json(deputy)
        })
}

let Promise = require('bluebird');
let ResponseBuilder = require('./ResponseBuilder.js');
let DateHelper = require('../../services/helpers/DateHelper.js');
let ResponseHelper = require('../../services/helpers/ResponseHelper.js');
let ThemeResponseHelper = require('./ThemeResponseHelper.js');
let BallotResponseHelper = require('./BallotResponseHelper.js');

const NUMBER_OF_DEPUTIES = 577;

var self = module.exports = {
    formatLawBallotsResponse: function(lawWithBallots, deputy) {
        return self.createLawResponse(lawWithBallots)
        .then(law => {
            return Promise.map(lawWithBallots.ballots, ballot => {
                return BallotResponseHelper.createBallotDetailsResponse(ballot, deputy)
            })
            .then(ballots => {
                law.ballots = ballots;
                return law;
            })
        })
    },

    createLawResponse: async function(law) {
        let typeName = law.typeId != null ? law.typeId.name : ' - type non déterminé'
        let contentType = law.ballotsCount > 1 ? 'Scrutins' : 'Scrutin'
        if (law.id) {
            contentType += ' de '
        }
        contentType += typeName.charAt(0).toLowerCase() + typeName.slice(1);
        let response = {
            id: law.id,
            contentType: contentType,
            name: law.name,
            type: law.typeId,
            lastBallotDate: DateHelper.formatDateForWS(law.lastBallotDate),
            ballotsCount: law.ballotsCount,
            fileUrl: law.fileUrl,
            theme: await ThemeResponseHelper.createThemeResponse(law.theme, law.name)
        }
        return response;
    }
}

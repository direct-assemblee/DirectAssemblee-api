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
        let title = law.ballotsCount > 1 ? 'Scrutins' : 'Scrutin'
        if (law.id) {
            title += ' de '
        }
        title += law.title.charAt(0).toLowerCase() + law.title.slice(1);
        let response = {
            id: law.id,
            title: title,
            lastBallotDate: DateHelper.formatDateForWS(law.lastBallotDate),
            ballotsCount: law.ballotsCount,
            fileUrl: law.fileUrl,
            theme: await ThemeResponseHelper.createThemeResponse(law.theme, law.originalThemeName)
        }
        return response;
    }
}

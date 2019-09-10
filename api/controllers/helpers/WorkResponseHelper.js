let Promise = require('bluebird');
let DateHelper = require('../../services/helpers/DateHelper.js');
let ResponseHelper = require('../../services/helpers/ResponseHelper.js');
let WorkTypeHelper = require('../../services/helpers/WorkTypeHelper.js');
let ThemeResponseHelper = require('./ThemeResponseHelper.js');
let QuestionHelper = require('./QuestionHelper.js');

var self = module.exports = {
    createWorkResponse: async function(work, extraInfos) {
        let type = await WorkTypeHelper.getNameForSubtype(work.subtypeId)
        let response = {
            id: work.id,
            type: type,
            name: work.name,
            date: DateHelper.formatDateForWS(work.date),
            fileUrl: work.url
        }

        var subtheme = await ThemeResponseHelper.createThemeResponse(work.subthemeId, work.unclassifiedTemporaryTheme);
        response.theme = subtheme.theme;

        let description = work.description;
        if (WorkTypeHelper.isQuestion(work.type)) {
            description = QuestionHelper.formatQuestionWithLineBreaks(description);
        }
        response.description = description;
        if (extraInfos && extraInfos.length > 0) {
            response.extraInfos = {};
            for (let i in extraInfos) {
                response.extraInfos[extraInfos[i].info] = extraInfos[i].value;
            }
        }
        if (WorkTypeHelper.isCommission(work.type)) {
            if (response.extraInfos) {
                response.title = response.extraInfos['commissionName']
            }
        } else if (WorkTypeHelper.isPublicSession(work.type)) {
            response.title = 'Séance publique'
        } else {
            if (WorkTypeHelper.isProposition(work.type) && !work.isAuthor) {
                response.type = 'cosigned_law_proposal'
            }
            response.title = work.title
        }
        return response;
    }
}

let Promise = require('bluebird');
let DateHelper = require('../../services/helpers/DateHelper.js');
let ResponseHelper = require('../../services/helpers/ResponseHelper.js');
let WorkTypeHelper = require('../../services/helpers/WorkTypeHelper.js');
let ThemeResponseHelper = require('./ThemeResponseHelper.js');
let QuestionHelper = require('./QuestionHelper.js');

var self = module.exports = {
    createWorkResponse: async function(work, extraInfos) {
        let description = work.description;
        if (await WorkTypeHelper.isQuestion(work.subtypeId)) {
            description = QuestionHelper.formatQuestionWithLineBreaks(description);
        }
        let type = await WorkTypeHelper.getSubtype(work.subtypeId)
        if (type.parentType.id == WorkTypeHelper.PROPOSITION.id) {
            type.name += work.isAuthor ? ' écrite' : ' co-signée'
        }
        let response = {
            id: work.id,
            name: work.name,
            date: DateHelper.formatDateForWS(work.date),
            fileUrl: work.url,
            description: description,
            workType: type
        }

        var subtheme = await ThemeResponseHelper.createThemeResponse(work.subthemeId, work.unclassifiedTemporaryTheme);
        response.theme = subtheme;

        if (extraInfos && extraInfos.length > 0) {
            response.extraInfos = {};
            for (let i in extraInfos) {
                response.extraInfos[extraInfos[i].info] = extraInfos[i].value;
            }
        }
        return response;
    }
}

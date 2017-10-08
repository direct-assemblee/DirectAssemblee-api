let Constants = require('./Constants.js');

module.exports = {
	sendPush: function(deputyId, type) {
		let activity = mockActivityOfType(type);
		PushNotifService.pushDeputyActivities(deputyId, [activity]);
    }
};

let mockActivityOfType = function(type) {
	let activity = {};
	activity.type = type;
	activity.date = '2017-08-31';
	switch(type) {
        case Constants.WORK_TYPE_QUESTIONS:
		activity.title = 'Question écrite';
		activity.description = 'M. Charles de La Verpillière appelle l\'attention de Mme la ministre des affaires sociales et de la santé sur une maladie rare dénommée « délétion 10Q26 ». Les principaux symptômes de cette ...';
		activity.theme = 'MOCK - Transports';
        break;
        case Constants.WORK_TYPE_REPORTS:
		activity.title = 'MOCK - Rapport';
		activity.description = 'Mesures pour le renforcement du dialogue social';
		activity.theme = 'Pouvoirs publics';
        break;
        case Constants.WORK_TYPE_PROPOSITIONS:
		activity.title = 'MOCK - Proposition de résolution';
		activity.description = 'Choix stratégiques du groupe Imperial Brands';
		activity.theme = 'Police et sécurité';
        break;
        case Constants.WORK_TYPE_COSIGNED_PROPOSITIONS:
		activity.title = 'MOCK - Proposition de résolution';
		activity.description = 'Commission d\'enquête relative à l\'attentat terroriste du 14 juillet 2016 à Nice';
		activity.theme = 'Questions sociales et santé';
        break;
        case Constants.WORK_TYPE_COMMISSIONS:
		activity.title = 'MOCK - Compte rendu de réunion';
		activity.description = 'Suite de l\'examen des articles des projets de loi ordinaire (n° 98) et organique (n° 99) rétablissant la confiance dans l\'action publique (Mme Yaël Braun-Pivet, rapporteure)';
        break;
        case Constants.WORK_TYPE_PUBLIC_SESSIONS:
		activity.title = 'MOCK - Compte rendu intégral';
		activity.description = '1. Renforcement du dialogue social - 2. Ordre du jour de la prochaine séance';
        break;
		default:
		activity.ballotId = 1222;
		activity.theme = 'MOCK - Travail';
		activity.title = 'Scrutin public sur l\'amendement n° 330 de M. Dharréville après l\'article 3 du projet de loi d\'habilitation à prendre par ordonnances les mesures pour le renforcement du dialogue social (première lecture).';
		activity.value = 'for';
		break;
    }
	return activity;
}

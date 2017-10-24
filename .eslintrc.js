module.exports = {
    'env': {
        'es6': true,
        'node': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'sourceType': 'module'
    },
    'globals': {
       '_': true,
       'sails': true,
       'async': true,
       'server': true,
       'describe': true,
       'before': true,
       'beforeEach': true,
       'after': true,
       'afterEach': true,
       'it': true,
       'should': true,

       'Constants': true,
       'Ballot': true,
       'Theme': true,
       'Declaration': true,
       'Department': true,
       'Deputy': true,
       'ExtraPosition': true,
       'ExtraInfo': true,
       'Mandate': true,
       'Subscriber': true,
       'Vote': true,
       'Work': true,

       'DeputyController': true,

       'BallotService': true,
       'DeclarationService': true,
       'DepartmentService': true,
       'ExtraInfoService': true,
       'ExtraPositionService': true,
       'DeputyService': true,
       'GeolocService': true,
       'LastWorksService': true,
       'MandateService': true,
       'PushNotifService': true,
       'TestService': true,
       'TimelineService': true,
       'VoteService': true,
       'WorkService': true,

       'ResponseHelper': true
   },
    'rules': {
        'no-console':0,
        'semi': 0,
        'linebreak-style': [
            'warn',
            'unix'
        ],
        'quotes': [
            'warn',
            'single'
        ]
    }
};

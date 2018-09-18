module.exports = {
    GENDER_FEMALE: 'F',
    GENDER_MALE: 'M',

    primaryKey: 'officialId',
    attributes: {
        createdAt: { type: 'string', autoCreatedAt: true, },
        updatedAt: { type: 'string', autoUpdatedAt: true, },
        officialId: {
            type: 'number',
            required: true,
            unique: true
        },
        gender: {
            type: 'string'
        },
        firstname: {
            type: 'string'
        },
        lastname: {
            type: 'string'
        },
        birthDate: {
            type: 'string'
        },
        parliamentGroup: {
            model: 'ParliamentGroup'
        },
        departmentId: {
            type: 'number'
        },
        district: {
            type: 'number'
        },
        phone: {
            type: 'string'
        },
        email: {
            type: 'string'
        },
        job: {
            type: 'string'
        },
        currentMandateStartDate: {
            type: 'string'
        },
        mandateEndDate: {
            type: 'string'
        },
        mandateEndReason: {
            type: 'string'
        },
        seatNumber: {
            type: 'number'
        },
        subscribers: {
            collection: 'subscriber',
            via: 'followedDeputiesIds',
            dominant: true
        },
        workCreations: {
            collection: 'work',
            via: 'authors',
            dominant: true
        },
        workParticipations: {
            collection: 'work',
            via: 'participants',
            dominant: true
        },
        activityRate: {
            type: 'number'
        }
    }
};

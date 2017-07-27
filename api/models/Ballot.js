module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        id: {
            type: 'int',
            primaryKey: true,
            autoIncrement: true
        },
        officialId: {
            type: 'int',
            unique: true
        },
        title: {
            type: 'text'
        },
        theme: {
            type: 'string'
        },
        date: {
            type: 'date'
        },
        dateDetailed: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        totalVotes: {
            type: 'int'
        },
        yesVotes: {
            type: 'int'
        },
        noVotes: {
            type: 'int'
        },
        isAdopted: {
            type: 'bool'
        },
        analysisUrl: {
            type: 'string'
        },
        fileUrl: {
            type: 'string'
        }
    }
};

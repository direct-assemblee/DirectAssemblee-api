module.exports = {
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        position: {
            type: 'string'
        },
        deputyId: {
            model: 'Deputy'
        }
    }
};

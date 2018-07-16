module.exports = {
    BUREAU: 'Bureau',
    PERMANENT_COMMISSION: 'Commission permanente',
    NON_PERMANENT_COMMISSION: 'Commission non permanente',
    OFFICE_AND_DELEGATION: 'Délégation et Office',

    attributes: {
        id: {
            type: 'number',
            autoIncrement: true
        },
        singular: {
            type: 'string'
        },
        plural: {
            type: 'string'
        }
    }
};

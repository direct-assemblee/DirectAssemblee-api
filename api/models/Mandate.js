module.exports = {
  autoCreatedAt: true,
  autoUpdatedAt: true,
  attributes: {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: 'string'
    },
    startingDate: {
      type: 'date'
    },
    endingDate: {
      type: 'date'
    },
    deputyId: {
      type: 'int',
      model: 'Deputy'
    }
  }
};

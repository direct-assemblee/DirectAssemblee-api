module.exports = {
    findDeclarationsForDeputy: function(deputyId) {
        return Declaration.find()
        .where({ deputyId: deputyId });
    }
}

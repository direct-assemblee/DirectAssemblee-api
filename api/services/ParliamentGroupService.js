module.exports = {
    findGroupWithId: function(groupId) {
        return ParliamentGroup.find()
        .where({ id: groupId });
    }
}

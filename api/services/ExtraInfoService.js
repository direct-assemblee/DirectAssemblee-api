module.exports = {
    findExtraInfosForWork: function(workId) {
        return ExtraInfo.find()
        .where({ workId: workId })
    }
}

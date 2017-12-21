module.exports = {
    findExtraInfosForWork: function(workId) {
        console.time('      findExtraInfosForWork for ' + workId);
        return ExtraInfo.find()
        .where({ workId: workId })
        .then(function(work) {
            console.timeEnd('      findExtraInfosForWork for ' + workId);
            return work
        })
    }
}

let Promise = require('bluebird');
let LRU = require('lru-cache'),
    options = {
        max: 1000,
        maxAge: 1000 * 60 * 60 * 4
    },
    cache = LRU(options);

const KEY_TIMELINE_PREFIX = 'timeline'
const KEY_LAW_BALLOTS_PREFIX = 'lawBallots'

let useCount = 0;

let self = module.exports = {
    getLawBallots: function(lawId) {
        return self.get(buildLawballotsKeyStart(lawId))
    },

    setLawBallots: function(lawId, content) {
        self.set(buildLawballotsKeyStart(lawId), content)
    },

    getLawBallotsForDeputy: function(lawId, deputyId) {
        return self.get(buildLawBallotsForDeputyKey(lawId, deputyId))
    },

    setLawBallotsForDeputy: function(lawId, deputyId, content) {
        self.set(buildLawBallotsForDeputyKey(lawId, deputyId), content)
    },

    getTimeline: function(deputyId, page, v1) {
        return self.get(buildTimelineKey(deputyId, page, v1))
    },

    setTimeline: function(deputyId, page, content, v1) {
        self.set(buildTimelineKey(deputyId, page, v1), content)
    },

    resetTimeline: function(deputyId) {
        let targetKey = buildTimelineKeyStart(deputyId)
        let keys = cache.keys()
        let promises = []
        for (let i in keys) {
            if (keys[i].startsWith(targetKey)) {
                promises.push(cache.del(keys[i]))
            }
        }
        return Promise.all(promises)
    },

    resetAll: function() {
        console.log('reset cache (length : ' + cache.length + ', useful ' + useCount + ' times)')
        useCount = 0;
        return cache.reset();
    },

    get: function(key) {
        return new Promise(function(resolve) {
            let cached = cache.get(key);
            if (cached) {
                useCount++;
            }
            resolve(cached);
        })
    },

    set: function(key, content) {
        cache.set(key, content)
    }
}

let buildLawBallotsForDeputyKey = function(lawId, deputyId) {
    return buildLawballotsKeyStart(lawId) + '_' + deputyId
}

let buildTimelineKey = function(deputyId, page, v1) {
    let key = buildTimelineKeyStart(deputyId) + '_' + page
    if (v1) {
        key += '_' + v1
    }
    return key
}

let buildLawballotsKeyStart = function(lawId) {
    return KEY_LAW_BALLOTS_PREFIX + '_' + lawId
}

let buildTimelineKeyStart = function(deputyId) {
    return KEY_TIMELINE_PREFIX + '_' + deputyId
}

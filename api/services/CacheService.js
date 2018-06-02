let Promise = require('bluebird');
let LRU = require('lru-cache'),
    options = {
        max: 1000,
        maxAge: 1000 * 60 * 60 * 4
    },
    cache = LRU(options);

let KEY_TIMELINE_PREFIX = 'timeline'
let useCount = 0;

let self = module.exports = {
    getTimeline: function(deputyId, page) {
        return self.get(buildTimelineKey(deputyId, page))
    },

    setTimeline: function(deputyId, page, content) {
        self.set(buildTimelineKey(deputyId, page), content)
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

let buildTimelineKey = function(deputyId, page) {
    return buildTimelineKeyStart(deputyId) + '_' + page
}

let buildTimelineKeyStart = function(deputyId) {
    return KEY_TIMELINE_PREFIX + '_' + deputyId
}

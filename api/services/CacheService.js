let Promise = require('bluebird');
let LRU = require('lru-cache'),
    options = {
        max: 1000,
        maxAge: 1000 * 60 * 60 * 4
    },
    cache = LRU(options);
let useCount = 0;

module.exports = {
    get: function(key) {
        return new Promise(function(resolve) {
            let cached = cache.get(key);
            if (cached) {
                useCount++;
            }
            resolve(cached);
        })
    },

    set: function(key, value) {
        cache.set(key, value)
    },

    reset: function() {
        console.log('reset cache (length : ' + cache.length + ', useful ' + useCount + ' times)')
        useCount = 0;
        cache.reset();
    }
}

var sails = require('sails');
var _ = require('lodash');

global.chai = require('chai');
global.should = chai.should();

before(function (done) {

    // Increase the Mocha timeout so that Sails has enough time to lift.
    this.timeout(5000);

    sails.lift({
        log: {
            level: 'silent'
        },
        hooks: {
            grunt: false
        },
        models: {
            datastore: 'testAssNatMysqlServer',
            migrate: 'drop'
        },
        datastores: {
            testAssNatMysqlServer: {
                adapter: 'sails-mysql',
                host: process.env.DATABASE_HOST || 'localhost',
                port: process.env.DATABASE_PORT || 3306,
                user: process.env.DATABASE_USER || 'root',
                password: process.env.DATABASE_PASSWORD || '',
                database: process.env.DATABASE_NAME || 'testdirectassemblee',
                charset:'utf8mb4'
            }
        }
    }, function (err, server) {
        if (err) {
            return done(err);
        }
        // here you can load fixtures, etc.
        done(err, sails);
    });
});

after(function (done) {
    // here you can clear fixtures, etc.
    if (sails && _.isFunction(sails.lower)) {
        sails.lower(done);
    }
});

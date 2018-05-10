let CronJob = require('cron').CronJob;
let EmailService = require('./EmailService.js');
var mysqlDump = require('mysqldump');
let fs = require('fs');

const BACKUP_CRON_TIME = '0 0 4 * * *'
const BACKUP_DEST_FILE = 'mysql-production.sql'

module.exports = {
    startBackupCron: function() {
        console.log('starting cron for database backup')
        new CronJob(BACKUP_CRON_TIME, function() {
            backup()
        }, null, true, 'Europe/Paris');
    }
}

let backup = function() {
    removeFile(BACKUP_DEST_FILE)
    mysqlDump({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'directassemblee',
        dest: BACKUP_DEST_FILE
    }, function(err) {
        if (err) {
            console.log('error dumping database ' + err)
        } else {
            return EmailService.sendFileByMail(BACKUP_DEST_FILE)
        }
    })
}

let removeFile = function(file) {
    fs.unlink(file, (err) => {
        if (err) {
            console.log('error removing file ' + err);
        } else {
            console.log('successfully deleted local file');
        }
    });
}

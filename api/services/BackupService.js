let CronJob = require('cron').CronJob;
let DateHelper = require('./helpers/DateHelper.js');
var mysqlDump = require('mysqldump');
let fs = require('fs');

const BACKUP_CRON_TIME = '0 0 4 * * *'
const BACKUP_DEST_FILE_PREFIX = './backup/mysql-production-'

module.exports = {
    startBackupCron: function() {
        console.log('starting cron for database backup')
        new CronJob(BACKUP_CRON_TIME, function() {
            backup()
        }, null, true, 'Europe/Paris');
    }
}

let backup = function() {
    let backupFile = BACKUP_DEST_FILE_PREFIX + DateHelper.getFormattedNow() + '.sql'
    let oldBackupFile = BACKUP_DEST_FILE_PREFIX + DateHelper.getDateForDaysBack(7) + '.sql'
    removeFile(backupFile)
    removeFile(oldBackupFile)
    mysqlDump({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'directassemblee',
        dest: backupFile
    }, function(err) {
        if (err) {
            console.log('error dumping database ' + err)
        } else {
            console.log('backup file ' + backupFile + ' is ready')
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

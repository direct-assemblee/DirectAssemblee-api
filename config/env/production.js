/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

 module.exports = {

    firebase: {
        configFile: 'firebase_service_account_prod.json',
        serverKey: 'AAAA3fPNV4Q:APA91bHHYVFDBV2WnSDf2SpqElpTXusvxxPgzkqw6Lsvw7qoVdAlpi0-TH8ZzKo4OocQaTDizXW3CqZFWWutBbgAoxdcaE30B13Z27G3wfL9TcvBcJjKdtWv-qAycVTsltozlETuXoeK'
    }
 };

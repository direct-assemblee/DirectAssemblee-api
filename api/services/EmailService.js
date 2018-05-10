var api_key = 'key-ebbfc9eff23fa37391a2a2ed9684dc0f';
var DOMAIN = 'sandbox3a4906a7d94046d5b8d768acb8f615f4.mailgun.org';

var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

module.exports = {
    sendFileByMail: function(file) {
        console.log('Sending new email with file : ' + file);
        var data = {
            from: 'DA api <dbdump@directassemblee.fr>',
            to: 'morgane.plat@gmail.com',
            subject: 'Nouveau dump sql',
            text: 'Cher ami' + ',\nCi-joint, le nouveau dump sql : \n' + file + '\n  \nSincerely,\nThe Management',
            attachment: file
        };
        return sendEmail(data);
    },
};

let sendEmail = function(data) {
    return mailgun.messages().send(data, function(error, body) {
        if (error) {
            console.log('error sending email : ' + error);
        }
    });
}

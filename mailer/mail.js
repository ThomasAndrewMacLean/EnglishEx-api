const AWS = require('aws-sdk');

const SES = new AWS.SES();

const sender = 'thomas.maclean@gmail.com';
let msg = 'Please use this code: ccc to confirm your email adres';
const subject = 'Please confirm your email address';

const sendEmail = (recipient, code) => {
    console.log('💌 sending mail...');

    const email = {
        Source: sender,
        Destination: { ToAddresses: [recipient] },
        Message: {
            Subject: { Data: subject },
            Body: { Text: { Data: msg.('ccc', code) } }
        }
    };
    return SES.sendEmail(email)
        .promise()
        .then(() => {
            console.log('EMAIL SENT');
            return 'ok';
        })
        .catch(err => {
            console.log('ERROR: EMAIL NOT SENT');
            console.log(err);
        });
};

module.exports = sendEmail;

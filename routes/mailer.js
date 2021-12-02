const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth:
    {
        user: process.env.EMAIL_CLIENT_USERNAME,
        pass: process.env.EMAIL_CLIENT_PASSWORD
    }
});

module.exports.sendMail = (email, subject, messageHTML) => {
    // send mail with defined transport object
    let mailOptions =
    {
        from: `"Sober.me" <abeebe@csumb.edu>`, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: messageHTML
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log(`Email confirmation sent to ${email}\nInfo: ${info.response}`);
        }
    });
}
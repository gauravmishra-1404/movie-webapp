const nodemailer = require('nodemailer');
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const { SENDGRID_API_KEY } = process.env;

// {
//     name: "Josh",
//     otp: "243255"
// }


function replaceContent(content, creds) {
    let allkeysArr = Object.keys(creds);
    allkeysArr.forEach(function (key) {
        // The pattern for placeholder can be anything that you decide
        // BUT make sure it's the same for html file and this file
        content = content.replace(`#{${key}}`, creds[key]);
    })

    return content;
}


async function emailHelper(templateName, reciverEmail, creds) {
    // console.log(templateName, reciverEmail, creds)
    try {
        const templatePath = path.join(__dirname, templateName);
        let content = await fs.promises.readFile(templatePath, "utf-8");
        const emailDetails = {
            to: reciverEmail,
            from: 'tarashankar.chakraborty_1@scaler.com',
            subject: 'Mail from ScalerShows',
            text: `Hi ${creds.name} this your reset otp ${creds.otp}`,
            html: replaceContent(content, creds),
        }

        // Configuration for sendgrid
        const transportDetails = {
            host: 'smtp.sendgrid.net',
            port: 465,
            auth: {
                user: "apikey",
                pass: SENDGRID_API_KEY
            }
        }

        const transporter = nodemailer.createTransport(transportDetails);
        await transporter.sendMail((emailDetails))
        console.log("email sent")
    } catch (err) {
        console.log(err)
    }

}

module.exports = emailHelper;

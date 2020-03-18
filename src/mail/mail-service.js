"use strict";
const nodemailer = require("nodemailer");
const config = require('../config');

const MailMan = {
    sendEmail(receiver, subject, body) {
        console.log('email')
        console.log(config.EMAIL_PASS, config.EMAIL_USER)
        // let transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     port: 587,
        //     secure: false, // true for 465, false for other ports
        //     auth: {
        //       user: config.EMAIL_USER, // generated ethereal user
        //       pass: config.EMAIL_PASS // generated ethereal password
        //     }
        //   });
        
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: config.EMAIL_USER,
                serviceClient: config.GSUITE_CLIENT_ID,
                privateKey: config.GSUITE_PRIVATE_KEY
            }
        })

        const mailOptions = {
            from: config.EMAIL_USER,
            to: receiver,
            subject,
            html: body
        }

        transporter.sendMail(mailOptions, function(err, info) {
            if (err)
                console.log(err)
            else 
                console.log(info)
        })
    },
    sendUserRegistration(user, password) {
        /*
            This is supposed to send an email as a middleware function during the user registration process
            It sends an email to the newly registered email with a personalized link that hits the /api/user/confirmation endpoint
            When the user clicks the link, it registers in the db row as confirmed!

            ~Chimp Chimperson
        */
        const key = Buffer.from(`${user.id}|${user.username}`).toString('base64')
        console.log(key)
        const html = `
            <div>
                <p>
                    Hello ${user.first_name.length + user.last_name.length === 0 ? 
                    user.username 
                    : user.first_name.concat(' ', user.last_name)},
                </p>
                <p>
                    We warmly welcome you to the PushNetwork, 
                </p>
                <p>
                    In order to get started, please set up your new password.
                </p>
                <p>
                    Your current password is: <span style="color:red; font-weight:700">${password}</span>
                </p>
                <a href="http://localhost:3000/confirm/${key}"><button>Set Up Password</button></a>
            </div>
        `

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: config.EMAIL_USER,
                serviceClient: config.GSUITE_CLIENT_ID,
                privateKey: config.GSUITE_PRIVATE_KEY
            }
        })

        const mailOptions = {
            from: config.EMAIL_USER,
            to: user.email,
            subject: "Please confirm PushNetwork registration",
            html
        }

        transporter.sendMail(mailOptions, function(err, info) {
            if (err)
                console.log(err)
            else 
                console.log(info)
        })
    }
}

module.exports = MailMan
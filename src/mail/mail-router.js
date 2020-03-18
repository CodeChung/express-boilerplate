const express = require('express')
const MailMan = require('./mail-service')
const { requireAuth } = require('../middleware/jwt-auth')

const mailRouter = express.Router()
const jsonBodyParser = express.json()

mailRouter
    .route('/')
    //   TODO: set up requireAuth with MariaDB
    //   .get(requireAuth, (req,res,next) => {
    .get((req, res, next) => {
        MailMan.sendEmail('harry@pushpros.com', 'Michael Here', 'I need your number pronto')
    })


module.exports = mailRouter
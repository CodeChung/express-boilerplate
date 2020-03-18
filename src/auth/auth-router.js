const express = require('express')
const xss = require('xss')
const path = require('path')
const AuthService = require('./auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter
    .route('/confirm')
    // .all(requireAuth)
    .post(jsonBodyParser, async (req, res, next) => {
        const {current_password, new_password} = req.body

        // TODO change to pass in real id not just 1
        const verifyPass = await AuthService.verifyPassword(9, current_password)

        if (!verifyPass) {
            return res.status(401).json({ error: 'Incorrect password, try again please' })
        } else {
            AuthService.changePassword(9, new_password)
                .then(changedPassword => res.json({ success: true }))
        }
    })


module.exports = authRouter
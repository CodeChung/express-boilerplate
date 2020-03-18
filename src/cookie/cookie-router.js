const express = require('express')
const xss = require('xss')
const path = require('path')
const { requireAuth } = require('../middleware/jwt-auth')

const cookieRouter = express.Router()
const jsonBodyParser = express.json()

cookieRouter
    .route('/')
    .all(requireAuth)
    .get((req, res) => {
        res.json({cookie: `Here's a warm and delicious cookie for ya!`})
    })

module.exports = cookieRouter
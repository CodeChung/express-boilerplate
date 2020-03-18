const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const { NODE_ENV } = require('./config')
const mailRouter = require('./mail/mail-router')
const usersRouter = require('./user/user-router')
const cookieRouter = require('./cookie/cookie-router')
const authRouter = require('./auth/auth-router')
const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test',
}))
app.use(cors())
app.use(helmet())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.get('/data', (req, res) => {
  console.log('cookies', req.cookies)
  res.json({
    data: [
      {
        id: 1,
        username: 'bob',
        email: 'bob@bob.com',
        role: 1
      },
      {
        id: 2,
        username: 'bill',
        email: 'bill@bob.com',
        role: 2
      },
      {
        id: 3,
        username: 'bam',
        email: 'bam@bob.com',
        role: 2
      }
    ]
  })
})

app.get('/beta', (req, res) => {
  res.json({
    data: [
      {
        id: 4,
        username: 'bobo',
        email: 'bob@bob.com',
        role: 1
      },
      {
        id: 5,
        username: 'billi',
        email: 'bill@bob.com',
        role: 2
      },
      {
        id: 6,
        username: 'bama',
        email: 'bam@bob.com',
        role: 2
      }
    ]
  })
})

app.use('/api/user', usersRouter)
app.use('/api/mail', mailRouter)
app.use('/api/cookie', cookieRouter)
app.use('/api/auth', authRouter)

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: 'server error' }
  } else {
    console.error(error)
    response = { error: error.message, details: error }
  }
  res.status(500).json(response)
})

module.exports = app

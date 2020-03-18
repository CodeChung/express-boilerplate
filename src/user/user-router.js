const express = require('express')
const xss = require('xss')
const path = require('path')
const UsersService = require('./user-service')
const AuthService = require('../auth/auth-service')
const { requireAuth } = require('../middleware/jwt-auth')
const MailMan = require('../mail/mail-service')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
    .route('/confirmation/:username-:id')
    .get((req, res) => {
        /*
            This endpoint is supposed to be hit from a newly minted user's email
            It verifies the that user's id matches the user's username and then changes the confirmed column
            Then it directs to a generic confirmed page, but user still has to login in
            okey dokey
            https://expressjs.com/en/guide/routing.html
            ~Chimp Chimperson
        */

        const { username, id} = req.params
        UsersService.confirmEmail(username, id)
    })

usersRouter
    .route('/register')
    .get((req, res) => UsersService.getMaria())
    .post(jsonBodyParser, (req, res, next) => {
        const { username, email, role, first_name, last_name, company } = req.body

        for (const field of ['username', 'role', 'email']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        UsersService.hasUserWithUserName(username)
            .then(async hasUserWithUserName => {
                console.log('hasuer', hasUserWithUserName)
                if (hasUserWithUserName) {
                    return res.status(400).json({ error: `Username already taken` })
                }
                const password = await UsersService.generatePassword()
                console.log(password)
                const newUser = {
                    username: xss(username),
                    email: xss(email),
                    password: xss(password.encrypted),
                    role: xss(role),
                    first_name: xss(first_name),
                    last_name: xss(last_name),
                    company: xss(company)
                }
                return UsersService.insertUser(newUser)
                    .then(user => {
                        console.log(user)
                        newUser.id = user.id
                        console.log('newsuser', newUser)
                        MailMan.sendUserRegistration(newUser, password.password)
                        return user
                    })
                    .then(user => {
                        res
                            .status(201)
                            .location(path.posix.join(req.originalUrl, `/${user.id}`))
                            .json(UsersService.serializeUser(user))
                    })

            })
            .catch(next)
    })

usersRouter
    .route('/login')
    .post(jsonBodyParser, (req, res, next) => {
        const { username, password } = req.body
        console.log(req.body)
        const loginUser = { username, password }
        console.log(loginUser)
        for (const [key, value] of Object.entries(loginUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
            }
        }

        UsersService.getUserWithUserName(loginUser.username)
            .then(dbUser => {
                if (!dbUser.length) {
                    return res.status(400).json({
                        error: 'User does not exist'
                    })
                }
                const user = dbUser[0]
                console.log(loginUser.password, user.password)
                return AuthService.comparePasswords(loginUser.password, user.password)
                    .then(passwordsMatch => {
                        console.log('math?', passwordsMatch)
                        if (!passwordsMatch) {
                            return res.status(400).json({
                                error: 'Incorrect username or password'
                            })
                        }

                        const sub = user.username
                        const payload = { user_id: user.id }
                        const jwt = AuthService.createJwt(sub, payload)
                        console.log('jwt', jwt)
                        res.status(201)
                            .cookie(
                                'push_access_key',
                                jwt,
                                {
                                    httpOnly: true
                                }
                            )
                            .json({ success: true })
                    })
            })
            .catch(next)
    })

usersRouter
    .route('/logout')
    .get((req, res, next) => {
        res.status(201)
            .cookie(
                'push_access_key',
                'yolo420' + Math.random() * 10,
                {
                    httpOnly: true
                }
            )
            .json({ success: true })
    })

usersRouter
    .route('/user')
        .all(requireAuth)
        .post((req, res, next) => {
            const { username } = req.body
        })

usersRouter
    .route('/users')
    // .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const { user_id } = req.body

        if (!user_id) {
            return res.status(403).json({ error: 'no admin id supplied' })
        }

        UsersService.getAdminUsers(user_id)
            .then(users => res.json(users))
            .catch(err => res.status(403).send(err))
    })

usersRouter
    .route('/check')
    // .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const { username } = req.body
        console.log(username, req.body)
        UsersService.hasUserWithUserName(username)
            .then(userExists => res.json({userExists}))
    })

module.exports = usersRouter
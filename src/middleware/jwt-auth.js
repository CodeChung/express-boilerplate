const UsersService = require('../user/user-service')
const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next) {
    const access_token = req.cookies['push_access_key'] || ''
    console.log('access_token', access_token)
    if (!access_token) {
        return res.status(401).json({ error: 'Missing access token'})
    }
    try {
        const payload = AuthService.verifyJwt(access_token)
        console.log('payload is', payload,  payload.sub, payload.user_id)
        UsersService.verifyUser(payload.sub, payload.user_id)
            .then(user => {
                if(!user)
                    return res.status(401).json({ error: 'Unauthorized request' })

                req.user = user
                next()
            })
            .catch(err => {
                console.error(err)
                next(err)
            })
    } catch(error) {
        console.log(error)
        res.status(401).json({ error: 'Unauthorized request' })
    }
}

module.exports = {
    requireAuth
}
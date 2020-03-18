const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const mariadb = require('mariadb')
const xss = require('xss')

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: '3306',
    database: process.env.DB_DATABASE,
    connectionLimit: 5
})

const AuthService = {
    getUserWithUserName(db, username) {
        return db('users')
            .where({username})
            .first()
    },
    comparePasswords(password, hash) {
        return bcrypt.compare(password, hash)
    },
    createJwt(subject, payload) {
        return jwt.sign(payload, config.JWT_SECRET, {
            subject,
            algorithm: 'HS256',
        })
    },
    verifyJwt(token) {
        console.log(token)
        return jwt.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256'],
        })
    },
    async verifyPassword(id, password) {
        let conn
        try {
            conn = await pool.getConnection()
            const rows = await conn.query(`SELECT * FROM users WHERE id=${xss(id)}`)
            delete rows.meta
            if (!rows.length) {
                return false
            }
            console.log(password, rows[0].password)
            return this.comparePasswords(password, rows[0].password)
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            if (conn) conn.release()
        }
    },
    async changePassword(id, password) {
        const sanitizedPass = await bcrypt.hash(xss(password), 12)
        console.log('sanitized', sanitizedPass)
        let conn
        try {
            conn = await pool.getConnection()
            const rows = await conn.query(`UPDATE users SET password='${sanitizedPass}' WHERE id=${xss(id)}`)
            delete rows.meta
            if (!rows.length) {
                return false
            }
            console.log(rows)
            return { success: true }
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            if (conn) conn.release()
        }
    }
}

module.exports = AuthService
const xss = require('xss')
const bcrypt = require('bcryptjs')
const mariadb = require('mariadb')
const mysql = require('mysql')
const generator = require('generate-password')

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: '3306',
    database: process.env.DB_DATABASE,
    connectionLimit: 5
})

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: '3306',
    database: process.env.DB_DATABASE
})

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
    async getAdminUsers(adminId) {
        let conn
        try {
            conn = await pool.getConnection()
            const rows = await conn.query(`
            select * from users
            `)
            delete rows.meta
            console.log(rows)
            return rows.map(user => ({
                email: user.email,
                username: user.username,
                role: user.role,
                confirmed: user.confirmed
            }))
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            if (conn) conn.release()
        }
    },
    async confirmEmail(username, id) {
        /*
            alters users table 
            ~Chimp Chimperson
        */
       let conn
        try {
            conn = await pool.getConnection()
            const rows = await conn.query(`UPDATE users SET confirmed=true WHERE username="${xss(username)}" and id=${xss(id)}`)
            delete rows.meta
            console.log(rows)
            return rows[0]
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            if (conn) conn.release()
        }
    },
    async verifyUser(username, id) {
        let conn
        try {
            conn = await pool.getConnection()
            const rows = await conn.query(`SELECT * FROM users WHERE username="${username}" and id=${id}`)
            delete rows.meta
            console.log(rows)
            return rows[0]
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            if (conn) conn.release()
        }
    },
    async getUserWithUserName(username) {
        let conn
        try {
            conn = await pool.getConnection()
            const rows = await conn.query(`SELECT * FROM users WHERE username="${username}"`)
            delete rows.meta
            console.log(rows)
            return rows
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            if (conn) conn.release()
        }
    },
    async hasUserWithUserName(username) {
        return await this.getUserWithUserName(username)
            .then(user => !!user.length)
    },
    async insertUser(newUser) {
        let conn
        try {
            conn = await pool.getConnection()
            const rows = await conn.query(`insert into users (email, password, username, role, first_name, last_name, company) values ('${newUser.email}', '${newUser.password}', '${newUser.username}', ${newUser.role}, '${newUser.first_name}', '${newUser.last_name}', '${newUser.company}');`)
            console.log(rows)
            const secondRow = await conn.query(`select * from users where username='${newUser.username}'`)
            console.log(secondRow[0], 'secondRow')
            const password = await conn.query(`insert into password_change (user_id, password) values (${secondRow[0].id}, '${secondRow[0].password}');`)
            return secondRow[0]
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            if (conn) conn.release()
        }
    },
    async getMaria() {
        let conn
        try {
            conn = await pool.getConnection()
            const rows = await conn.query("SELECT * FROM users")
            console.log(rows)
            return rows
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            if (conn) conn.release()
        }
    },
    validatePassword(password) {
        if (password.length < 8) {
            return 'Password must be longer than 8 characters'
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain 1 upper case, lower case, number and special character'
        }
        return null
    },
    async generatePassword() {
        const password = generator.generate({ length: 8, numbers: true })
        const encrypted = await bcrypt.hash(password, 12)
        return { password, encrypted }
    },
    serializeUser(user) {
        return {
            id: user.id,
            user_name: xss(user.user_name),
            date_created: new Date(user.date_created)
        }
    }
}

module.exports = UsersService
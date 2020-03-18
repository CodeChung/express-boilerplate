require('dotenv').config()
const app = require('./app')
const { PORT, DB_HOST, DB_USER, DB_PASS, DB_DATABASE } = require('./config')
const knex = require('knex')

const db = knex({
  client: 'mysql',
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_DATABASE
  },
})


app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})
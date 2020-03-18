module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/dashy',
  JWT_SECRET: process.env.JWT_SECRET || 'teehee im a secret',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_DATABASE: process.env.DB_DATABASE,
  GSUITE_PRIVATE_KEY: process.env.GSUITE_PRIVATE_KEY,
  GSUITE_CLIENT_ID: process.env.GSUITE_CLIENT_ID
}
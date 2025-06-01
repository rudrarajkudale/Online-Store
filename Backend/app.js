require('dotenv').config()
const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)

const userRoutes = require('./routes/user')
const shopRoutes = require('./routes/store')
const adminRoutes = require('./routes/admin')

const app = express()

const frontendUrl = process.env.FRONTEND_URL;
app.use(cors({
  origin: frontendUrl,
  credentials: true,
}))

app.use(express.json())

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

db.connect((err) => {
  if (err) throw err
  console.log('MySQL Connected')
})

const sessionStore = new MySQLStore({}, db.promise())

app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET || 'your-secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: false,
    sameSite: 'lax'
  }
}))

app.use('/user', userRoutes(db))
app.use('/stores', shopRoutes(db))
app.use('/admin', adminRoutes(db))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

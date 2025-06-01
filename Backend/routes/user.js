const express = require('express')
const { signup, login, updatePassword, getUserNameById } = require('../controllers/user')

module.exports = (db) => {
  const router = express.Router()

  router.post('/signup', signup(db))
  router.post('/login', login(db))
  router.post('/update-password', updatePassword(db))
  router.get('/:id', getUserNameById(db));

  return router
}

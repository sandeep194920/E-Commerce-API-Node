const { register, login, logout } = require('../controllers/authController')

const express = require('express')
const router = express.Router()

// showing both ways here but I prefer router.post syntax when there's a single route
router.route('/register').post(register)
router.post('/login', login)
router.route('/logout').get(logout)

module.exports = router

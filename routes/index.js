const express = require('express')
const router = express.Router()
const passport = require('passport')

const restController = require('../controllers/restaurant-controller')
const admin = require('./modules/admin')
const userController = require('../controllers/user-controller')

const { generalErrorHandler } = require('../middleware/error-handler')
const { authenticated } = require('../middleware/auth')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)
router.use('/admin', admin)
router.get('/restaurant', authenticated, restController.getRestaurants)
router.get('/', (req, res) => {
  res.redirect('/restaurant')
})
router.use('/', generalErrorHandler)

module.exports = router

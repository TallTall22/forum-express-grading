const express = require('express')
const router = express.Router()
const restController = require('../controllers/restaurant-controller')
const admin = require('./modules/admin')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.use('/admin', admin)
router.get('/restaurant', restController.getRestaurants)
router.get('/', (req, res) => {
  res.redirect('/restaurant')
})
router.use('/', generalErrorHandler)

module.exports = router

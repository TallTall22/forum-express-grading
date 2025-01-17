const express = require('express')
const router = express.Router()
const passport = require('passport')

const admin = require('./modules/admin')
const restController = require('../../controllers/pages/restaurant-controller')
const userController = require('../../controllers/pages/user-controller')
const commentController = require('../../controllers/pages/comment-controller')
const upload = require('../../middleware/multer')
const { generalErrorHandler } = require('../../middleware/error-handler')
const { authenticated, adminAuthenticated } = require('../../middleware/auth')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/users/top', authenticated, userController.getTopusers)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', upload.single('image'), userController.putUser)

router.get('/logout', userController.logout)
router.use('/admin', adminAuthenticated, admin)

router.get('/restaurants/top', authenticated, restController.getTopRestaurant)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)

router.delete('/comments/:id', authenticated, commentController.deleteComment)
router.post('/comments', authenticated, commentController.postComment)

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.deleteFavorite)

router.post('/following/:id', authenticated, userController.addFollowing)
router.delete('/following/:id', authenticated, userController.deleteFollowing)

router.get('/', (req, res) => {
  res.redirect('/restaurants')
})
router.use('/', generalErrorHandler)
module.exports = router

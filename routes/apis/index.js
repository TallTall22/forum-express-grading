const express = require('express')
const router = express.Router()
const passport = require('passport')

const admin = require('./modules/admin')
const restController = require('../../controllers/apis/restaurant-controller.js')
const userController = require('../../controllers/apis/user-controller')
const commentController = require('../../controllers/apis/comment-controller')
const { apiErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticateAdmin } = require('../../middleware/api-auth')
const upload = require('../../middleware/multer')

router.use('/admin', authenticated, authenticateAdmin, admin)

router.post('/signup', userController.signUp)
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.get('/users/top', authenticated, userController.getTopusers)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', upload.single('image'), userController.putUser)

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

router.get('/', (req, res) => { res.redirect('/restaurants') })

router.use('/', apiErrorHandler)
module.exports = router

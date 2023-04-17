const { Restaurant, Category, User, Comment } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    const id = req.params.id
    Restaurant.findByPk(id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUser' }
      ],
      order: [[Comment, 'createdAt', 'desc']]
    })
      .then(restaurant => {
        const isFavorite = restaurant.FavoritedUser.some(f => f.id === req.user.id)
        if (!restaurant) throw new Error('This restaurant is not existed')
        restaurant.increment('viewCounts', { by: 1 })
        res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorite })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    const id = req.params.id
    Restaurant.findByPk(id, {
      include: [Category, Comment, { model: User, as: 'FavoritedUser' }]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('This restaurant is not existed')
        const CommentCount = restaurant.Comments.length
        const favoriteCount = restaurant.FavoritedUser.length
        res.render('dashboard', { restaurant: restaurant.toJSON(), CommentCount, favoriteCount })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'desc']],
        include: Category,
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'desc']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  },
  getTopRestaurant: (req, res, next) => {
    Restaurant.findAll({
      include: { model: User, as: 'FavoritedUser' }
    })
      .then(restaurants => {
        restaurants = restaurants.map(restaurant => ({
          ...restaurant.toJSON(),
          favoriteCount: restaurant.FavoritedUser.length,
          isFavorite: restaurant.FavoritedUser.some(f => f.id === req.user.id)
        }))
        restaurants = restaurants.sort((a, b) => b.favoriteCount - a.favoriteCount)
        console.log(restaurants.length)
        restaurants.splice(10, restaurants.length - 10)
        return restaurants
      })
      .then(restaurants => res.render('top-restaurants', { restaurants }))
      .catch(err => next(err))
  }
}

module.exports = restaurantController

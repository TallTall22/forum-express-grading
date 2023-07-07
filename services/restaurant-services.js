const { Restaurant, Category, User, Comment } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantServices = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 9
    const categoryId = Number(req.query.categoryId) || ''
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const page = Number(req.query.page) || 1
    const offset = getOffset(limit, page)
    Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        where: {
          ...categoryId ? { categoryId } : {}
        },
        limit,
        offset,
        raw: true,
        nest: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantId = req.user?.FavoriteRestaurant ? req.user.FavoriteRestaurant.map(fr => fr.id) : []
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorite: favoritedRestaurantId.includes(r.id)
        }))
        return cb(null, {
          restaurants: data, categories, categoryId, pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
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
        return cb(null, {
          restaurant: restaurant.toJSON(), isFavorite
        })
      })
      .catch(err => cb(err))
  },
  getDashboard: (req, cb) => {
    const id = req.params.id
    Restaurant.findByPk(id, {
      include: [Category, Comment, { model: User, as: 'FavoritedUser' }]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('This restaurant is not existed')
        const CommentCount = restaurant.Comments.length
        const favoriteCount = restaurant.FavoritedUser.length
        return cb(null, {
          restaurant: restaurant.toJSON(), CommentCount, favoriteCount
        })
      })
      .catch(err => cb(err))
  },
  getFeeds: (req, cb) => {
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
        return cb(null, {
          restaurants, comments
        })
      })
      .catch(err => cb(err))
  },
  getTopRestaurant: (req, cb) => {
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
      .then(restaurants => {
        return cb(null, { restaurants })
      })
      .catch(err => cb(err))
  }
}

module.exports = restaurantServices

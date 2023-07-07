const bcrypt = require('bcryptjs')
const { localFileHandler } = require('../helpers/file-helper')
const { User, Restaurant, Favorite, Followship, Comment } = require('../models')

const userService = {
  signUpPage: (req, cb) => {
    cb(null)
  },
  signUp: (req, cb) => {
    const { name, email, password, passwordCheck } = req.body
    if (password !== passwordCheck) throw new Error('Passwords do not match')
    User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('Email already exists')

        return bcrypt.hash(password, 10)
      })
      .then(hash => User.create({
        name,
        email,
        password: hash
      }))
      .then(createdUser => {
        return cb(null, createdUser)
      })
      .catch(err => cb(err))
  },
  signInPage: (req, cb) => {
    cb(null)
  },
  signIn: (req, cb) => {
    cb(null)
  },
  logout: (req, cb) => {
    req.logout()
    cb(null)
  },
  getUser: (req, cb) => {
    const id = req.params.id
    const userSelf = req.user
    User.findByPk(id, {
      include: [
        { model: Comment, include: Restaurant },
        { model: Restaurant, as: 'FavoriteRestaurant' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ],
      nest: true
    })
      .then(user => {
        user = user.toJSON()
        const comments = user.Comments
        const filterComments = comments.filter((comment, index) => {
          return index === comments.findIndex(x => x.restaurantId === comment.restaurantId)
        })
        return cb(null, { user, userSelf, filterComments })
      })

      .catch(err => cb(err))
  },
  editUser: (req, cb) => {
    const id = req.params.id
    const userId = req.user.id
    if (userId !== Number(id)) throw new Error('You do not have permission to edit profile!')
    User.findByPk(id, {
      raw: true
    })
      .then(user => {
        return cb(null, { user })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    const id = req.params.id
    const name = req.body.name
    if (!name) throw new Error('User name is required!')
    const { file } = req
    Promise.all([
      User.findByPk(id),
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        return user.update({
          name,
          image: filePath || user.image
        })
          .then(updatedUser => {
            return cb(null, { updatedUser })
          })
          .catch(err => cb(err))
      })
  },
  addFavorite: (req, cb) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error('The restaurant is not existed!')
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({
          userId,
          restaurantId
        })
      })
      .then(newFavorite => {
        return cb(null, { newFavorite })
      })
      .catch(err => cb(err))
  },
  deleteFavorite: (req, cb) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    Favorite.findOne({
      where: {
        userId,
        restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this restaurant")
        return favorite.destroy()
      })
      .then(deletedFavorite => {
        return cb(null, { deletedFavorite })
      })
      .catch(err => cb(err))
  },
  getTopusers: (req, cb) => {
    User.findAll({
      include: { model: User, as: 'Followers' }
    })
      .then(users => {
        users = users.map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: req.user.Followings.some(f => f.id === user.id)
        }))
        return users.sort((a, b) => b.followerCount - a.followerCount)
      })
      .then(users => {
        return cb(null, { users })
      })
      .catch(err => cb(err))
  },
  addFollowing: (req, cb) => {
    const id = req.params.id
    const userId = req.user.id
    Promise.all([
      User.findByPk(id),
      Followship.findOne({
        where: {
          followerId: userId,
          followingId: id
        }
      })])
      .then(([user, followship]) => {
        if (!user) throw new Error('This user is not existed!')
        if (followship) throw new Error('You are already following this user')
        return Followship.create({
          followerId: userId,
          followingId: id
        })
      })
      .then(newFollowing => {
        return cb(null, { newFollowing })
      })
      .catch(err => cb(err))
  },
  deleteFollowing: (req, cb) => {
    const id = req.params.id
    const userId = req.user.id
    Followship.findOne({
      where: {
        followerId: userId,
        followingId: id
      }
    })
      .then(followship => {
        if (!followship) throw new Error('You are not following this user')
        return followship.destroy()
      })
      .then(deletedFollowing => {
        return cb(null, { deletedFollowing })
      })
      .catch(err => cb(err))
  }
}

module.exports = userService

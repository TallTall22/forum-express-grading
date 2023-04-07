const bcrypt = require('bcryptjs')
const { localFileHandler } = require('../helpers/file-helper')
const db = require('../models')
const { User, Restaurant, Favorite } = db

const usercontroller = {
  signUpPage: (req, res) => {
    res.render('sign')
  },
  signUp: (req, res, next) => {
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
      .then(() => {
        req.flash('success_msg', 'register successed')
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_msg', 'Login successed')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.logout()
    req.flash('success_msg', 'Logout successed')
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    const id = req.params.id
    const userId = req.user.id
    User.findByPk(id, {
      raw: true
    })
      .then(user => res.render('profile', { user, userId }))
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    const id = req.params.id
    const userId = req.user.id
    if (userId !== id) throw new Error('You do not have permission to edit profile!')
    User.findByPk(id, {
      raw: true
    })
      .then(user => res.render('edit-profile', { user }))
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
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
          .then(() => {
            req.flash('success_msg', 'restaurant was successfully to update ')
            res.redirect(`/users/${id}`)
          })
          .catch(err => next(err))
      })
  },
  addFavorite: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  deleteFavorite: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = usercontroller

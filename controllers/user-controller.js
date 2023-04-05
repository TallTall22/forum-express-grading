const bcrypt = require('bcryptjs')
const db = require('../models')
const { User } = db
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
  }
}

module.exports = usercontroller

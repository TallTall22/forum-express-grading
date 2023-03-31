const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())
  // customize user field
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
  },
  // authenticate user
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) {
          return cb(null, false, req.flash('error_msg', 'Email or password is incorrect'))
        }
        return bcrypt.compare(password, user.password).then(isMath => {
          if (!isMath) {
            return cb(null, false, req.flash('error_msg', 'Email or password is incorrect'))
          }
          return cb(null, user)
        })
      })
  }
  ))

  // serialize and deserialize user
  passport.serializeUser((user, cb) => {
    cb(null, user.id)
  })
  passport.deserializeUser((id, cb) => {
    User.findByPk(id)
      .then(user => {
        user = user.toJSON()
        cb(null, user)
      })
  })
}

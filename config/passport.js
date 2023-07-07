const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')
const { User, Restaurant, Comment } = require('../models')

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

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

  const jwtOption = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  }

  passport.use(new JWTStrategy(jwtOption, (jwtPayload, cb) => {
    User.findByPk(jwtPayload.id, {
      include: [
        Comment,
        { model: Restaurant, as: 'FavoriteRestaurant' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
      .then(user => cb(null, user))
      .catch(err => cb(err))
  }))
  // serialize and deserialize user
  passport.serializeUser((user, cb) => {
    cb(null, user.id)
  })
  passport.deserializeUser((id, cb) => {
    User.findByPk(id, {
      include: [
        Comment,
        { model: Restaurant, as: 'FavoriteRestaurant' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
      .then(user => cb(null, user.toJSON()))
      .catch(err => cb(err))
  })
}

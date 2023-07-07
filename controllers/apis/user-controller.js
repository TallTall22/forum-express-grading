const jwt = require('jsonwebtoken')
const userService = require('../../services/user-services')
const userController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  },
  signUp: (req, res, next) => {
    userService.signUp(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUser: (req, res, next) => {
    userService.getUser(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  editUser: (req, res, next) => {
    userService.editUser(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putUser: (req, res, next) => {
    userService.putUser(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  addFavorite: (req, res, next) => {
    userService.addFavorite(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteFavorite: (req, res, next) => {
    userService.deleteFavorite(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getTopusers: (req, res, next) => {
    userService.getTopusers(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  addFollowing: (req, res, next) => {
    userService.addFollowing(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteFollowing: (req, res, next) => {
    userService.deleteFollowing(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = userController

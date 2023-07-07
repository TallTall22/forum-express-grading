const userService = require('../../services/user-services')

const usercontroller = {
  signUpPage: (req, res) => {
    res.render('sign')
  },
  signUp: (req, res, next) => {
    userService.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', 'register successed')
      res.redirect('/signin', data)
    })
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
    userService.getUser(req, (err, data) => err ? next(err) : res.render('profile', data))
  },
  editUser: (req, res, next) => {
    userService.editUser(req, (err, data) => err ? next(err) : res.render('edit-profile', data))
  },
  putUser: (req, res, next) => {
    userService.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_msg', 'restaurant was successfully to update ')
      res.redirect(`/users/${req.params.id}`, data)
    })
  },
  addFavorite: (req, res, next) => {
    userService.addFavorite(req, (err, data) => err ? next(err) : res.redirect('back', data))
  },
  deleteFavorite: (req, res, next) => {
    userService.deleteFavorite(req, (err, data) => err ? next(err) : res.redirect('back', data))
  },
  getTopusers: (req, res, next) => {
    userService.getTopusers(req, (err, data) => err ? next(err) : res.render('top-users', data))
  },
  addFollowing: (req, res, next) => {
    userService.addFollowing(req, (err, data) => err ? next(err) : res.redirect('back', data))
  },
  deleteFollowing: (req, res, next) => {
    userService.deleteFollowing(req, (err, data) => err ? next(err) : res.redirect('back', data))
  }
}

module.exports = usercontroller

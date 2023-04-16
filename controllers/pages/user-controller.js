const bcrypt = require('bcryptjs')
const { localFileHandler } = require('../../helpers/file-helper')
const db = require('../../models')
const { User, Restaurant, Favorite, Followship, Comment } = db

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
        console.log(filterComments)
        res.render('profile', { user, userSelf, filterComments })
      })

      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    const id = req.params.id
    const userId = req.user.id
    if (userId !== Number(id)) throw new Error('You do not have permission to edit profile!')
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
  },
  getTopusers: (req, res, next) => {
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
        res.render('top-users', { users })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  deleteFollowing: (req, res, next) => {
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
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = usercontroller

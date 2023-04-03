const { Restaurant, User, Category } = require('../models')
const { localFileHandler } = require('../helpers/file-helper')

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(err => next(err))
  },
  createRestaurant: (req, res, next) => {
    Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required')
    const { file } = req
    localFileHandler(file)
      .then(filePath =>
        Restaurant.create({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null,
          categoryId
        })
      )

      .then(() => {
        req.flash('success_msg', 'restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    const id = req.params.id
    Restaurant.findByPk(id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant is not exist')
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    const id = req.params.id
    Promise.all([
      Restaurant.findByPk(id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error('Restaurant is not exist')
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const id = req.params.id
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required')

    const { file } = req
    Promise.all([Restaurant.findByPk(id), localFileHandler(file)])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error('Restaurant is not exist')
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          categoryId
        })
      })
      .then(() => {
        req.flash('success_msg', 'restaurant was successfully to update ')
        res.redirect(`/admin/restaurants/${id}`)
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    const id = req.params.id
    Restaurant.findByPk(id)
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant is not exist')
        return restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => next(err))
  },
  getUsers: (req, res, next) => {
    User.findAll({
      raw: true
    })
      .then(users => res.render('admin/users', { users }))
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    const id = req.params.id
    User.findByPk(id)
      .then(user => {
        if (user.email === process.env.SUPER_USER_EMAIL) throw new Error('This user permission can not be change')
        return user.update({ isAdmin: !user.isAdmin })
      })
      .then(() => {
        req.flash('success_msg', 'User was successfully to update ')
        res.redirect('/admin/users')
      })
      .catch(err => next(err))
  }
}

module.exports = adminController

const { Restaurant, Category, User } = require('../models')
const { localFileHandler } = require('../helpers/file-helper')

const adminServices = {
  getRestaurants: cb => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: Category
    })
      .then(restaurants => {
        return cb(null, { restaurants })
      })
      .catch(err => cb(err))
  },
  createRestaurant: (req, cb) => {
    Category.findAll({
      raw: true
    })
      .then(categories => { return cb(null, { categories }) })
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
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

      .then(newRestaurant => {
        cb(null, { restaurant: newRestaurant })
      })
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
    const id = req.params.id
    Restaurant.findByPk(id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant is not exist')
        return cb(null, { restaurant })
      })
      .catch(err => cb(err))
  },
  editRestaurant: (req, cb) => {
    const id = req.params.id
    Promise.all([
      Restaurant.findByPk(id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error('Restaurant is not exist')
        return cb(null, { restaurant, categories })
      })
      .catch(err => cb(err))
  },
  putRestaurant: (req, cb) => {
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
      .then(editedRestaurant => {
        return cb(null, { editedRestaurant })
      })
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    const id = req.params.id
    Restaurant.findByPk(id)
      .then(restaurant => {
        if (!restaurant) {
          const err = new Error('Restaurant is not exist')
          err.status = 404
          throw err
        }
        return restaurant.destroy()
      })
      .then(deletedrestaurant => cb(null, { restaurant: deletedrestaurant }))
      .catch(err => cb(err))
  },
  getUsers: (req, cb) => {
    User.findAll({
      raw: true
    })
      .then(users => {
        return cb(null, { users })
      })
      .catch(err => cb(err))
  },
  patchUser: (req, cb) => {
    const id = req.params.id
    User.findByPk(id)
      .then(user => {
        if (user.email === process.env.SUPER_USER_EMAIL) throw new Error('This user permission can not be change')
        return user.update({ isAdmin: !user.isAdmin })
      })
      .then(user => {
        return cb(null, { user })
      })
      .catch(err => cb(err))
  }
}

module.exports = adminServices

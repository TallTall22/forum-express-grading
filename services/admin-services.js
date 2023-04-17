const { Restaurant, Category } = require('../models')
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
  }
}

module.exports = adminServices

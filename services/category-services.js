const { Category, Restaurant } = require('../models')

const categoryController = {
  getCategories: (req, cb) => {
    const id = req.params.id
    Promise.all([
      Category.findAll({ raw: true }),
      id ? Category.findByPk(id, { raw: true }) : null
    ])
      .then(([categories, category]) => { return cb(null, { categories, category }) })
      .catch(err => cb(err))
  },
  postCategory: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return Category.create({
      name
    })
      .then(createdCategory => { return cb(null, { createdCategory }) })
      .catch(err => cb(err))
  },
  putCategory: (req, cb) => {
    const { name } = req.body
    const id = req.params.id
    if (!name) throw new Error('Category name is required!')
    Category.findByPk(id)
      .then(category => {
        return category.update({
          name
        })
      })

      .then(editedCategory => { return cb(null, { editedCategory }) })
      .catch(err => cb(err))
  },
  deleteCategory: (req, cb) => {
    const id = req.params.id
    Category.findByPk(id)
      .then(category => {
        Restaurant.update({ categoryId: 0 }, {
          where: { categoryId: category.id }
        })
        return category.destroy()
      })
      .then(deletedCategory => { return cb(null, { deletedCategory }) })
      .catch(err => cb(err))
  }
}

module.exports = categoryController

const { Category, Restaurant } = require('../models')

const categoryController = {
  getCategories: (req, res, next) => {
    const id = req.params.id
    Promise.all([
      Category.findAll({ raw: true }),
      id ? Category.findByPk(id, { raw: true }) : null
    ])
      .then(([categories, category]) => res.render('admin/categories', { categories, category }))
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    Category.create({
      name
    })
      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
  },
  putCategory: (req, res, next) => {
    const { name } = req.body
    const id = req.params.id
    if (!name) throw new Error('Category name is required!')
    Category.findByPk(id)
      .then(category => category.update({
        name
      }))

      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
  },
  deleteCategory: (req, res, next) => {
    const id = req.params.id
    Category.findByPk(id)
      .then(category => {
        category.destroy()
        Restaurant.update({ categoryId: 0 }, {
          where: { categoryId: category.id }
        })
      })
      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
  }
}

module.exports = categoryController

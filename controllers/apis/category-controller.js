const categoryService = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => {
    categoryService.getCategories(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  postCategory: (req, res, next) => {
    categoryService.postCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putCategory: (req, res, next) => {
    categoryService.putCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteCategory: (req, res, next) => {
    categoryService.deleteCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = categoryController

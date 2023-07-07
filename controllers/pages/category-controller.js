const categoryService = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => {
    categoryService.getCategories(req, (err, data) => err ? next(err) : res.render('admin/categories', data))
  },
  postCategory: (req, res, next) => {
    categoryService.postCategory(req, (err, data) => {
      if (err) return next(err)
      req.session.createdCategory = data
      res.redirect('/admin/categories')
    })
  },
  putCategory: (req, res, next) => {
    categoryService.putCategory(req, (err, data) => {
      if (err) return next(err)
      req.session.editedCategory = data
      res.redirect('/admin/categories')
    })
  },
  deleteCategory: (req, res, next) => {
    categoryService.deleteCategory(req, (err, data) => {
      if (err) return next(err)
      req.session.deletedCategory = data
      res.redirect('/admin/categories')
    })
  }
}

module.exports = categoryController

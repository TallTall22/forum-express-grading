const commentService = require('../../services/comment-service')

const commentController = {
  postComment: (req, res, next) => {
    commentService.postComment(req, (err, data) => {
      if (err) return next(err)
      req.session.newComment = data
      res.redirect(`/restaurants/${req.body.restaurantId}`)
    })
  },
  deleteComment: (req, res, next) => {
    commentService.postComment(req, (err, data) => {
      if (err) return next(err)
      req.session.newComment = data
      res.redirect(`/restaurants/${req.body.restaurantId}`)
    })
  }
}

module.exports = commentController

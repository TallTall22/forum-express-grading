const commentService = require('../../services/comment-service')

const commentController = {
  postComment: (req, res, next) => {
    commentService.postComment(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteComment: (req, res, next) => {
    commentService.postComment(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = commentController

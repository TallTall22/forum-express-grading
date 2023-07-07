const { User, Restaurant, Comment } = require('../models')

const commentController = {
  postComment: (req, cb) => {
    const { restaurantId, text } = req.body
    const userId = req.user.id
    if (!text) throw new Error('Comment text is required!')
    Promise.all([
      Restaurant.findByPk(restaurantId),
      User.findByPk(userId)
    ])
      .then(([restaurant, user]) => {
        if (!restaurant) throw new Error('The Restaurant is not existed')
        if (!user) throw new Error('This user is not existed')
        return Comment.create({
          text,
          restaurantId,
          userId
        })
      })
      .then(createdComment => cb(null, { createdComment }))
      .catch(err => cb(err))
  },
  deleteComment: (req, cb) => {
    const id = req.params.id
    Comment.findByPk(id)
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        return comment.destroy()
      })
      .then(deleteComment => { return cb(null, { deleteComment }) })
      .catch(err => cb(err))
  }
}

module.exports = commentController

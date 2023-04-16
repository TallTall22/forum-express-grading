const { User, Restaurant, Comment } = require('../../models')

const commentController = {
  postComment: (req, res, next) => {
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
      .then(() => res.redirect(`/restaurants/${restaurantId}`))
      .catch(err => next(err))
  },
  deleteComment: (req, res, next) => {
    const id = req.params.id
    Comment.findByPk(id)
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        return comment.destroy()
      })
      .then(deleteComment => res.redirect(`/restaurants/${deleteComment.restaurantId}`))
      .catch(err => next(err))
  }
}

module.exports = commentController

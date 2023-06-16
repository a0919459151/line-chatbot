const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    userId: String,
    displayName: String,
    pictureUrl: String
  }
)

userSchema.index({ userId: 1 })

module.exports = mongoose.model('User', userSchema)

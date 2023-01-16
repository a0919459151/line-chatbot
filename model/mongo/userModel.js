const mongoose = require('mongoose')

module.exports = (() => {
  mongoose.connect(process.env.MONGO_LOCAL_URL)
  const userSchema = new mongoose.Schema(
    {
      userId: String,
      displayName: String,
      pictureUrl: String
    }
  )

  userSchema.index({ userId: 1 })

  return mongoose.model('user', userSchema)
})()

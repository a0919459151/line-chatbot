const mongoose = require('mongoose')

module.exports = (() => {
  mongoose.connect(process.env.MONGO_LOCAL_URL)
  const groupSchema = new mongoose.Schema(
    {
      type: String,
      groupId: String
    }
  )

  groupSchema.index({ groupId: 1 })

  return mongoose.model('group', groupSchema)
})()

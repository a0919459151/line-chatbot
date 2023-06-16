const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema(
  {
    type: String,
    groupId: String
  }
)

groupSchema.index({ groupId: 1 })

module.exports = mongoose.model('Group', groupSchema)

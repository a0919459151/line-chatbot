const mongoose = require('mongoose')

const scheduleSchema = new mongoose.Schema(
  {
    clientId: String,
    time: Date,
    activity: String
  }
)

scheduleSchema.index({ clientId: 1, time: 1 })

module.exports = mongoose.model('Schedule', scheduleSchema)

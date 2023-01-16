const mongoose = require('mongoose')

module.exports = (() => {
  mongoose.connect(process.env.MONGO_LOCAL_URL)
  const scheduleSchema = new mongoose.Schema(
    {
      clientId: String,
      time: Date,
      activity: String
    }
  )

  scheduleSchema.index({ clientId: 1, time: 1 })

  return mongoose.model('schedule', scheduleSchema)
})()

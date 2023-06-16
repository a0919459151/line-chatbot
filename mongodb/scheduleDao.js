const dayjs = require('dayjs')

const { scheduleModel } = require('../model')

async function addToMongo (clientId, activity, time) {
  await scheduleModel.create({ clientId, activity, time })
}

async function deleteFromMongo (_id) {
  await scheduleModel.deleteOne({ _id })
}

async function getScheduelList (clientId) {
  return await scheduleModel.find({ clientId }, { _id: 1, time: 1, activity: 1 }, { sort: { time: 1 } }).exec()
}

async function getOneUserPushList (clientId) {
  const dayjsSixAm = dayjs().hour(6).minute(0).second(0)
  const dayjsNextDaySixAm = dayjsSixAm.add(1, 'day')

  return await scheduleModel.find({ clientId, time: { $gt: dayjsSixAm.toDate(), $lt: dayjsNextDaySixAm.toDate() } }, { _id: 1, time: 1, activity: 1 }, { sort: { time: 1 } }).exec()
}

module.exports = {
  addToMongo,
  deleteFromMongo,
  getScheduelList,
  getOneUserPushList
}

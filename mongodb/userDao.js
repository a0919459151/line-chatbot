const { userModel } = require('../model')

async function addToMongo (source, profile) {
  const { userId } = source
  const { displayName, pictureUrl } = profile

  await userModel.create({ userId, displayName, pictureUrl })
}

async function deleteFromMongo (userId) {
  await userModel.deleteOne({ userId })
}

async function getUserList () {
  return await userModel.distinct('userId').exec()
}

module.exports = { addToMongo, deleteFromMongo, getUserList }

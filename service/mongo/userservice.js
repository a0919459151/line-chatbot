const userModel = require('../../model/mongo/userModel')

async function addToMongo (source, profile) {
  const { userId } = source
  const { displayName, pictureUrl } = profile

  await userModel.create({ userId, displayName, pictureUrl })
}

async function deleteFromMongo (userId) {
  await userModel.deleteOne({ userId })
}

module.exports = { addToMongo, deleteFromMongo }

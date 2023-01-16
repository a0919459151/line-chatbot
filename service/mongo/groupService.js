const groupModel = require('../../model/mongo/groupModel')

async function addToMongo (source) {
  const { type, groupId } = source
  await groupModel.create({ type, groupId })
}

async function deleteFromMongo (groupId) {
  await groupModel.deleteOne({ groupId })
}

module.exports = { addToMongo, deleteFromMongo }

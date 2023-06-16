const { groupModel } = require('../model')

async function addToMongo (source) {
  const { type, groupId } = source
  await groupModel.create({ type, groupId })
}

async function deleteFromMongo (groupId) {
  await groupModel.deleteOne({ groupId })
}

async function getGroupList () {
  return await groupModel.distinct('groupId').exec()
}

module.exports = { addToMongo, deleteFromMongo, getGroupList }

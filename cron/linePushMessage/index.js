require('dotenv').config()

const line = require('@line/bot-sdk')
const dayjs = require('dayjs')

const userModel = require('../../model/mongo/userModel')
const groupModel = require('../../model/mongo/groupModel')

const scheduleService = require('../../service/mongo/scheduleService')

const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
})

async function pushMessage () {
  const a = await userModel.distinct('userId').exec()
  const b = await groupModel.distinct('groupId').exec()
  const c = a.concat(b)

  c.forEach((ele) => {
    pushMessagetoOneUser(ele)
  })
}

async function pushMessagetoOneUser (id) {
  const apiResult = await scheduleService.getOneUserPushList(id)
  if (apiResult.length === 0) return // no push

  const textMessage = (() => {
    const initText = '【今日行程】'
    const dayjsMidnight = dayjs().startOf('day').add(1, 'day')
    return apiResult.reduce(
      (acc, curr) => {
        if (dayjs(curr.time).isAfter(dayjsMidnight)) return `${acc}\n(凌晨) ${dayjs(curr.time).format('HH:mm')} - ${curr.activity}`
        return `${acc}\n${dayjs(curr.time).format('HH:mm')} - ${curr.activity}`
      },
      initText
    )
  })()

  return client.pushMessage(id, {
    type: 'text',
    text: textMessage
  })
}

module.exports = pushMessage

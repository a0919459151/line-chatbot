require('dotenv').config()

const line = require('@line/bot-sdk')
const mongoose = require('mongoose')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Taipei')

const { userDao, groupDao, scheduleDao } = require('../../../mongodb')

const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
})

// 推波給所有使用者
async function pushMessage () {
  const a = await userDao.getUserList()
  const b = await groupDao.getGroupList()
  const c = a.concat(b)

  const arr = []
  c.forEach((ele) => {
    arr.push(pushMessagetoOneUser(ele))
  })
  await Promise.all(arr)
}

async function pushMessagetoOneUser (id) {
  const apiResult = await scheduleDao.getOneUserPushList(id)
  if (apiResult.length === 0) return // no push

  const textMessage = (() => {
    const initText = '【今日行程】'
    const dayjsMidnight = dayjs().tz().startOf('day').add(1, 'day')
    return apiResult.reduce(
      (acc, curr) => {
        console.log(curr.activity, dayjs(curr.time).unix())
        if (dayjs(curr.time).isAfter(dayjsMidnight)) return `${acc}\n(凌晨) ${dayjs(curr.time).tz().format('HH:mm')} - ${curr.activity}`
        return `${acc}\n${dayjs(curr.time).tz().format('HH:mm')} - ${curr.activity}`
      },
      initText
    )
  })()

  return client.pushMessage(id, {
    type: 'text',
    text: textMessage
  })
}

; (async function () {
  await mongoose.connect(process.env.MONGO_LOCAL_URL
    , {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).catch((err) => {
    console.log(err)
  })
  await pushMessage()
  await mongoose.connection.close()
})()

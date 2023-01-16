const line = require('@line/bot-sdk')
const querystring = require('querystring')
const _ = require('lodash')
const dayjs = require('dayjs')

const getWeatherImageUri = require('../../model/api/weather')

const userService = require('../mongo/userservice')
const groupService = require('../mongo/groupService')
const scheduleService = require('../mongo/scheduleService')

const schedule = require('./schedule')

// create LINE SDK client
const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
})

const scheduleHelpMSG = {
  type: 'text',
  text: `行事曆
用法:
  行事曆 看
  行事曆 加 <活動名稱> *不得超過10個字
                    ex: 行事曆 加 唱歌
  行事曆 刪
  行事曆 清空 // 尚未完成`
}

const chillMapMSG = {
  type: 'imagemap',
  baseUrl: 'https://github.com/a0919459151/line_chatbot_static/raw/main/chill',
  altText: 'Imagemap alt text',
  baseSize: {
    width: 1040,
    height: 1040
  },
  actions: [
    {
      area: {
        x: 0,
        y: 0,
        width: 520,
        height: 520
      },
      type: 'uri',
      linkUri: 'https://www.youtube.com/'
    },
    {
      area: {
        x: 520,
        y: 0,
        width: 520,
        height: 520
      },
      type: 'uri',
      linkUri: 'https://www.netflix.com/browse'
    },
    {
      area: {
        x: 0,
        y: 520,
        width: 520,
        height: 520
      },
      type: 'uri',
      linkUri: 'https://www.disneyplus.com/zh-hant/home'
    },
    {
      area: {
        x: 520,
        y: 520,
        width: 520,
        height: 520
      },
      type: 'uri',
      linkUri: 'https://www.tiktok.com/zh-Hant-TW/'
    }
  ]
}

// event handler
async function handleEvent (event) {
  if (event.replyToken && event.replyToken.match(/^(.)\1*$/)) {
    return console.log('Test hook recieved: ' + JSON.stringify(event.message))
  }

  const clientId = switchClientTypeAndReturnId(event.source.type)

  switch (event.type) {
    case 'follow':
    {
      console.log(`Followed this bot: ${JSON.stringify(event)}`)

      const profile = await client.getProfile(event.source.userId)
      await userService.addToMongo(event.source, profile)

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '歡迎你成為我的朋友<3'
      })
    }

    case 'unfollow':
      console.log(`Unfollowed this bot: ${JSON.stringify(event)}`)
      await userService.deleteFromMongo(event.source.userId)
      break

    case 'join':
      console.log(`Joined: ${JSON.stringify(event)}`)
      await groupService.addToMongo(event.source)

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `Joined ${event.source.type}`
      })

    case 'leave':
      console.log(`Left: ${JSON.stringify(event)}`)
      await groupService.deleteFromMongo(event.source.groupId)
      break

    case 'message':
    {
      const message = event.message
      switch (message.type) {
        case 'text':
          console.log(`Got message event: ${JSON.stringify(event, null, '\t')}`)

          return handleText(message, event.replyToken, event.source)

        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`)
      }
    }

    case 'postback':
    {
      console.log(`Got postback event: ${JSON.stringify(event, null, '\t')}`)
      const obj = {
        data: event.postback.data,
        time: _.get(event, 'postback.params.datetime', undefined)
      }

      return handlePostback(clientId, event.replyToken, obj)
    }

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`)
  }
}

function switchClientTypeAndReturnId (type) {
  let clientId
  if (type === 'user') clientId = event.source.userId
  if (type === 'group') clientId = event.source.groupId
  if (type === 'room') clientId = event.source.roomId
  console.log(`${event.source.type} ID: ${event.source.userId}`)

  return clientId
}

async function handleText (message, replyToken, source) {
  const headText = message.text.trim().split(' ')[0] // service name
  const bodyTextArr = message.text.trim().split(' ').slice(1) // action name

  switch (headText) {
    case '指令':
      return client.replyMessage(replyToken, {
        type: 'text',
        text: '哈囉\n行事曆\n天氣雷達\n耍廢地圖'
      })

    case '哈囉':
      return client.replyMessage(replyToken, {
        type: 'text',
        text: '哈囉'
      })

    case '行事曆':
    {
      if (bodyTextArr.length === 0) return client.replyMessage(replyToken, scheduleHelpMSG)

      const msg = await schedule.process(source, bodyTextArr) // process input body text & return message
      return client.replyMessage(replyToken, msg)
    }

    case '天氣雷達':
    {
      const weatherImageUri = await getWeatherImageUri()
      return client.replyMessage(replyToken, {
        type: 'image',
        originalContentUrl: weatherImageUri,
        previewImageUrl: weatherImageUri
      })
    }

    case '耍廢地圖':
      return client.replyMessage(replyToken, chillMapMSG)
  }
}

async function handlePostback (clientId, replyToken, postback) {
  let { data, time } = postback
  data = querystring.parse(data)
  time = dayjs(time)
  let notifyTime
  if (time.get('hour') > 6) notifyTime = time.add(1, 'day')
  notifyTime = time.format('YYYY/MM/DD 早上6點')

  if (_.get(data, 'action') === 'addAct') {
    await scheduleService.addToMongo(clientId, data.activity, time.format())
    console.log(`mongo save ${clientId} ${data.activity} ${time.format()}`)
    return client.replyMessage(replyToken, {
      type: 'text',
      text: `將於 ${notifyTime} 向你發送提醒！`
    })
  }

  if (_.get(data, 'action') === 'delAct') {
    await scheduleService.deleteFromMongo(data._id)
    return client.replyMessage(replyToken, {
      type: 'text',
      text: `刪除 ${data._id}`
    })
  }

  return client.replyMessage(replyToken, {
    type: 'text',
    text: '傻逼 不要亂按'
  })
}

module.exports = handleEvent

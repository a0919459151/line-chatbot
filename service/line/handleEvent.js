const util = require('util')
const line = require('@line/bot-sdk')
const querystring = require('querystring')
const _ = require('lodash')
const dayjs = require('dayjs')

const getWeatherImageUri = require('../../api/weatherImage')
const getWeatherObj = require('../../api/weather')

const { userDao, groupDao, scheduleDao } = require('../../mongodb')

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
  行事曆 加 <活動名稱>
    範例: 行事曆 加 唱歌
    ＊活動名稱上限10個字
  行事曆 刪`
}

// event handler
async function handleEvent (event) {
  if (event.replyToken?.match(/^(.)\1*$/)) {
    return console.log('Test hook recieved: ' + JSON.stringify(event.message))
  }
  console.log('event: ', util.inspect(event, { depth: null }))
  const clientId = switchClientTypeAndReturnId(event.source)

  switch (event.type) {
    case 'follow':
    {
      console.log(`Followed this bot: ${JSON.stringify(event)}`)

      const profile = await client.getProfile(event.source.userId)
      await userDao.addToMongo(event.source, profile)

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '歡迎你成為我的好友<3\n請輸入 "指令" 來獲得指令提示！'
      })
    }

    case 'unfollow':
      console.log(`Unfollowed this bot: ${JSON.stringify(event)}`)
      await userDao.deleteFromMongo(event.source.userId)
      break

    case 'join':
      console.log(`Joined: ${JSON.stringify(event)}`)
      await groupDao.addToMongo(event.source)

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `Joined ${event.source.type}`
      })

    case 'leave':
      console.log(`Left: ${JSON.stringify(event)}`)
      await groupDao.deleteFromMongo(event.source.groupId)
      break

    case 'message':
    {
      const message = event.message
      if (message.type === 'text') {
        console.log(`Got message event: ${JSON.stringify(event, null, '\t')}`)

        return handleText(message, event.replyToken, event.source)
      } else { throw new Error(`Unknown message: ${JSON.stringify(message)}`) }
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

function switchClientTypeAndReturnId (source) {
  let clientId
  if (source.type === 'user') clientId = source.userId
  if (source.type === 'group') clientId = source.groupId
  if (source.type === 'room') clientId = source.roomId
  console.log(`${source.type} ID: ${source.userId}`)

  return clientId
}

async function handleText (message, replyToken, source) {
  const headText = message.text.trim().split(' ')[0] // service name
  const bodyTextArr = message.text.trim().split(' ').slice(1) // action name

  switch (headText) {
    case '指令':
      return client.replyMessage(replyToken, {
        type: 'text',
        text: '可以輸入以下指令：\n行事曆\n天氣\n天氣雷達圖'
      })

    case '行事曆':
    {
      if (bodyTextArr.length === 0) return client.replyMessage(replyToken, scheduleHelpMSG)

      const msg = await schedule.process(source, bodyTextArr) // process input body text & return message
      return client.replyMessage(replyToken, msg)
    }

    case '天氣':
    {
      const weatherObj = await getWeatherObj()
      return client.replyMessage(replyToken, {
        type: 'text',
        text: `天氣：${weatherObj.weather}\n溫度：${weatherObj.temperature}\n描述：${weatherObj.description}`
      })
    }

    case '天氣雷達圖':
    {
      const weatherImageUri = await getWeatherImageUri()
      return client.replyMessage(replyToken, {
        type: 'image',
        originalContentUrl: weatherImageUri,
        previewImageUrl: weatherImageUri
      })
    }
  }
}

async function handlePostback (clientId, replyToken, postback) {
  let { data, time } = postback
  data = querystring.parse(data)
  time = dayjs(time).tz('Asia/Taipei', true)
  const notifyTime = time.get('hour') > 6
    ? time.add(1, 'day').format('YYYY/MM/DD 早上06點')
    : time.format('YYYY/MM/DD 早上06點')
  if (_.get(data, 'action') === 'addAct') {
    await scheduleDao.addToMongo(clientId, data.activity, time.toDate())
    console.log(`mongo save ${clientId} ${data.activity} ${time.format()}`)
    return client.replyMessage(replyToken, {
      type: 'text',
      text: `${time.format('YYYY/MM/DD')} ${data.activity}
將於 ${notifyTime} 向你發送提醒！`
    })
  }

  if (_.get(data, 'action') === 'delAct') {
    await scheduleDao.deleteFromMongo(data._id)
    return client.replyMessage(replyToken, {
      type: 'text',
      text: '刪除成功'
    })
  }

  return client.replyMessage(replyToken, {
    type: 'text',
    text: '傻逼 不要亂按'
  })
}

module.exports = handleEvent

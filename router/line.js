require('dotenv').config()

const express = require('express')
const line = require('@line/bot-sdk')
const getWeatherImageUri = require('../model/weather')
const ga4 = require('../lib/ga4')

const router = express.Router()

// create LINE SDK client
const client = new line.Client({
  channelAccessToken: process.env['CHANNEL_ACCESS_TOKEN'],
  channelSecret: process.env['CHANNEL_SECRET']
})

router.get('/', (req, res) => res.end(`I'm listening. Please access with POST.`))

router.post('/', (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err)
      res.status(500).end()
    })
})

// event handler
function handleEvent(event) {
  if (event.replyToken && event.replyToken.match(/^(.)\1*$/)) {
    return console.log('Test hook recieved: ' + JSON.stringify(event.message))
  }
  console.log(`User ID: ${event.source.userId}`)

  switch (event.type) {
    case 'message':
      const message = event.message
      switch (message.type) {
        case 'text':
          console.log(`Sent message: ${JSON.stringify(event)}`)
          return handleText(message, event.replyToken, event.source)
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`)
      }

    case 'follow':
      console.log(`Followed this bot: ${JSON.stringify(event)}`)
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '歡迎你成為我的朋友<3'
      })

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`)
    
    case 'join':
      console.log(`Joined: ${JSON.stringify(event)}`)
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `Joined ${event.source.type}`
      })

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`)

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`)
  }
}

async function handleText(message, replyToken) {
  switch (message.text) {
    case '指令':
      return client.replyMessage(replyToken, {
        type: 'text',
        text: `圖片\n圖片地圖\nquick reply\n天氣雷達`
      })
    case '天氣雷達':
      const weatherImageUri = await getWeatherImageUri()
      ga4.send(
        'clint_id_Joe_Chiu',
        [
          {
            name: 'joeEvent',
            params: {
              test: 'testttt'
            }
          }
        ]
      )
      return client.replyMessage(replyToken, {
        type: 'image',
        originalContentUrl: weatherImageUri,
        previewImageUrl: weatherImageUri
      
      })
    case '圖片':
      return client.replyMessage(replyToken, {
        type: 'image',
        originalContentUrl: 'https://raw.githubusercontent.com/a0919459151/line_chatbot_static/main/image.png',
        previewImageUrl: 'https://raw.githubusercontent.com/a0919459151/line_chatbot_static/main/image.png'
      })
 
    case '圖片地圖':
      return client.replyMessage(replyToken, [
        {
          type: 'imagemap',
          baseUrl: 'https://github.com/a0919459151/line_chatbot_static/raw/main/rich',
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
              linkUri: 'https://store.line.me/family/manga/en'
            },
            {
              area: {
                x: 520,
                y: 0,
                width: 520,
                height: 520
              },
              type: 'uri',
              linkUri: 'https://store.line.me/family/music/en'
            },
            {
              area: {
                x: 0,
                y: 520,
                width: 520,
                height: 520
              },
              type: 'uri',
              linkUri: 'https://store.line.me/family/play/en'
            },
            {
              area: {
                x: 520,
                y: 520,
                width: 520,
                height: 520
              },
              type: 'message',
              text: 'URANAI!'
            },
          ]
        }
      ])

    case 'quick reply':
      return client.replyMessage(replyToken,
        {
          type: 'text',
          text: 'Quick reply sample 😁',
          quickReply: {
            items: [
              {
                type: 'action',
                action: {
                  type: 'camera',
                  label: 'Send camera'
                }
              },
              {
                type: 'action',
                action: {
                  type: 'cameraRoll',
                  label: 'Send camera roll'
                }
              },
              {
                type: 'action',
                action: {
                  type: 'location',
                  label: 'Send location'
                }
              }
            ]
          },
        }
      )
  }
}


module.exports = router

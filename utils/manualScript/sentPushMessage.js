require('dotenv').config()

const line = require('@line/bot-sdk')

const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
})

const clientId = 'C0ca3bac872c805cd28f8f54fddbf38cc'

  ; (async function () {
  await client.pushMessage(
    clientId,
    {
      type: 'text',
      text: '哈囉'
    }
  )
  console.log('push message')
})()

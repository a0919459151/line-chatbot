require('dotenv').config()

const express = require('express')
const helmet = require('helmet')
const line = require('@line/bot-sdk')
const lineRouter = require('./router/line')

const app = express()
const port = 8080

app.use(helmet())

app.get('/', (req, res) => {
  res.send('Webhook server on!')
})

app.use('/webhook', line.middleware({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
}), lineRouter)

app.listen(port, () => {
  console.log(`line chatbot webhook server listening on port ${port}`)
})

require('dotenv').config()

const express = require('express')
const helmet = require('helmet')
const line = require('@line/bot-sdk')
const mongoose = require('mongoose')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Taipei')

const lineRouter = require('./router/line')

const app = express()
const port = 8080

app.use(helmet())

app.get('/', (req, res) => {
  res.send('Webhook server on!')
  console.log('hello~')
})

app.use('/webhook', line.middleware({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
}), lineRouter)

connect()

function listen () {
  app.listen(port)
  console.log('Express app started on port ' + port)
}

async function connect () {
  mongoose.connection
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen)
  return mongoose.connect(process.env.MONGO_LOCAL_URL, {
    keepAlive: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
}

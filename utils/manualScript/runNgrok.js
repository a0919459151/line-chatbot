require('dotenv').config()

const ngrok = require('ngrok')

const authToken = process.env.NGROK_AUTH_TOKEN
const port = 8080

  ; (async function () {
  await ngrok.authtoken(authToken)
  const url = await ngrok.connect(port)
  console.log(url)
})()

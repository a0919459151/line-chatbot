const ngrok = require('ngrok')

const authToken = '2Iw1IgRiiPnoUdfTxJzBfcQQFEv_3qkExiG1ynyAbG981wvxE'
const port = 8080

;(async function () {
  await ngrok.authtoken(authToken)
  const url = await ngrok.connect(port)
  console.log(url)
})()

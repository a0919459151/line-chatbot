require('dotenv').config()
const axios = require('axios')

module.exports = async function () {
  const apiresult = await axios.get(`${process.env.SPIDER_API_URL}stockData/2330`)
  console.log('2330 stock data: ', JSON.stringify(apiresult.data))
  return apiresult.data
}

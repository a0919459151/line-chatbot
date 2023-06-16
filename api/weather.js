const axios = require('axios')

// 中央氣象局開放資料平臺之資料擷取API
// locationName : 新北市 -> utf-8
const apiurl = 'https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=rdec-key-123-45678-011121314&locationName=%E6%96%B0%E5%8C%97%E5%B8%82'

async function main () {
  const response = await axios.get(apiurl)

  const weather = response.data.records.location[0].weatherElement[0]
  const temperature = response.data.records.location[0].weatherElement[2]
  const description = response.data.records.location[0].weatherElement[3]
  const weatherObj = {
    weather: weather.time[0].parameter.parameterName,
    temperature: temperature.time[0].parameter.parameterName + '度',
    description: description.time[0].parameter.parameterName
  }

  return weatherObj
}

module.exports = main

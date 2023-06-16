const axios = require('axios')

// 政府資料開放平臺 雷達回波圖
const apiurl = 'https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0058-004?Authorization=rdec-key-123-45678-011121314&format=JSON'

async function main () {
  const response = await axios.get(apiurl)
  const imageUri = response.data.cwbopendata.dataset.resource.uri
  return imageUri
}

module.exports = main

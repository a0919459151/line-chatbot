const dayjs = require('dayjs')

const { scheduleDao } = require('../../mongodb')

/**
 * 行事曆 指令處理模組
 * 情況：
 * 看
 * 加 <活動名稱>
 * 刪
 * @param { string[] } bodyTextArr
 * @returns
 */
async function process (source, bodyTextArr) {
  const action = bodyTextArr[0]
  const activity = bodyTextArr[1] || null

  return genMSG(action, activity, source)
}

async function genMSG (action, activity, source) {
  let clientId

  if (source.type === 'user') clientId = source.userId
  if (source.type === 'group') clientId = source.groupId
  if (source.type === 'room') clientId = source.roomId

  let resultsArr

  switch (action) {
    case '看':
      resultsArr = await scheduleDao.getScheduelList(clientId)

      if (resultsArr.length === 0) return genTextMessage('行事曆裡目前沒有活動')
      return genListMessage(resultsArr)

    case '加':
      if (activity === null) return genTextMessage('請輸入: 行事曆 加 <活動名稱>')
      if (activity.length > 10) return genTextMessage('警告: 活動不得超過10個字')
      return genAddMessage(activity)

    case '刪':
      resultsArr = await scheduleDao.getScheduelList(clientId)
      if (resultsArr.length === 0) return genTextMessage('行事曆裡目前沒有活動')
      return genDeleteMessage(resultsArr)

    default:
      return genTextMessage('不支援的指令')
  }
}

function genListMessage (resultsArr) {
  const bodyContent = []
  resultsArr.forEach(raw => {
    bodyContent.push(genListBodyContentRaw(raw.time, raw.activity))
  })
  return {
    type: 'flex',
    altText: 'this is a flex message',
    contents: {
      type: 'bubble',
      direction: 'ltr',
      header: {
        type: 'box',
        backgroundColor: '#ffaaaa',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '行事曆清單',
            align: 'center',
            contents: []
          }
        ]
      },
      body: {
        type: 'box',
        backgroundColor: '#aaffaa',
        layout: 'vertical',
        spacing: 'sm',
        contents: bodyContent
      }
    }
  }
  /**
   * for func genListMessage to gen raw body
   */
  function genListBodyContentRaw (time, activity) {
    time = dayjs(time).format('YYYY.MM.DD')
    return {
      type: 'box',
      layout: 'horizontal',
      alignItems: 'center',
      contents: [
        {
          type: 'text',
          adjustMode: 'shrink-to-fit',
          text: time
        },
        {
          type: 'text',
          adjustMode: 'shrink-to-fit',
          text: activity
        }
      ]
    }
  }
}

function genAddMessage (activity) {
  return {
    type: 'flex',
    altText: 'this is a flex message',
    contents: {
      type: 'bubble',
      direction: 'ltr',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#ffaaaa',
        contents: [
          {
            type: 'text',
            text: `新增活動 ${activity}`,
            size: 'xl',
            align: 'center',
            contents: []
          }
        ]
      },
      hero: {
        type: 'image',
        url: 'https://vos.line-scdn.net/bot-designer-template-images/bot-designer-icon.png',
        margin: 'none',
        size: 'full',
        aspectRatio: '1.51:1',
        aspectMode: 'fit',
        backgroundColor: '#aaffaa'
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        backgroundColor: '#aaffaa',
        contents: [
          {
            type: 'button',
            style: 'primary',
            action: {
              type: 'datetimepicker',
              label: '選取時間',
              data: `action=addAct&activity=${activity}`,
              mode: 'datetime'
            }
          }
        ]
      }
    }
  }
}

function genDeleteMessage (resultsArr) {
  const bodyContent = []
  resultsArr.forEach(raw => {
    bodyContent.push(genDeleteBodyContentRaw(raw._id, raw.time, raw.activity))
  })
  return {
    type: 'flex',
    altText: 'this is a flex message',
    contents: {
      type: 'bubble',
      direction: 'ltr',
      header: {
        type: 'box',
        backgroundColor: '#ffaaaa',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '行事曆刪除清單',
            align: 'center',
            contents: []
          }
        ]
      },
      body: {
        type: 'box',
        backgroundColor: '#aaffaa',
        layout: 'vertical',
        spacing: 'sm',
        contents: bodyContent
      }
    }
  }

  /**
  * for func genDeleteMessage to gen raw body
  */
  function genDeleteBodyContentRaw (_id, time, activity) {
    time = dayjs(time).tz().format('YYYY.MM.DD')
    return {
      type: 'box',
      layout: 'horizontal',
      alignItems: 'center',
      contents: [
        {
          type: 'text',
          adjustMode: 'shrink-to-fit',
          text: time
        },
        {
          type: 'text',
          adjustMode: 'shrink-to-fit',
          text: activity
        },
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'postback',
            label: '刪除',
            data: `action=delAct&_id=${_id}`
          }
        }
      ]
    }
  }
}

function genTextMessage (text) {
  return {
    type: 'text',
    text
  }
}

module.exports = { process }

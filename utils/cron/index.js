const CronJob = require('cron').CronJob

const pushMessage = require('./linePushMessage')

const job = new CronJob(
  '0 0 6 * * *',
  pushMessage,
  null,
  true,
  'Asia/Taipei'
)

job.start()

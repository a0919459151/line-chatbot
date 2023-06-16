require('dotenv').config()
const express = require('express')
const router = express.Router()

const handleEvent = require('../service/line/handleEvent')

router.post('/', (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('err: ', err)
      res.status(500).end()
    })
})

module.exports = router

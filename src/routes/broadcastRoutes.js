const express = require('express')
const router = express.Router()
const { getLiveContent, getAllLiveContent } = require('../controllers/broadcastController')

router.get('/all', getAllLiveContent)
router.get('/live/:teacherId', getLiveContent)

module.exports = router
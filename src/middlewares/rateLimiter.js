const rateLimit = require('express-rate-limit');

const apiLimiter=rateLimit({
    windowMs: 15*60*1000,
    max: 5000,   // <-- temporarily raised from 100, FOR LOCAL TESTING ONLY
    message:{
        success: false,
        error: 'Too many requests, please try again after 15 minutes.'
    },
     standardHeaders: true,
  legacyHeaders: false
})

const authLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 1000,   // <-- temporarily raised from 5 to 1000, FOR LOCAL TESTING ONLY
     message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes'
  }
})

const broadcastLimiter = rateLimit({
    windowMs: 1*60*1000,
    max: 60,
    message: {
        success: false,
        error: 'Too many broadcast messages, please try again after 1 minute.'
    }
})
module.exports = { apiLimiter, authLimiter, broadcastLimiter }
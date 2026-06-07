const rateLimit = require('express-rate-limit');

const apiLimiter=rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    message:{
        success: false,
        error: 'Too many requests, please try again after 15 minutes.'
    },
     standardHeaders: true,
  legacyHeaders: false
})

const authLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 5,
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
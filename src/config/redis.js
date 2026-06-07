const redis = require('redis')

let client = null
let isConnected = false

const getClient = async () => {
  if (isConnected && client) return client

  client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  })

  client.on('error', (err) => {
    console.error('❌ Redis error:', err.message)
    isConnected = false
  })

  client.on('connect', () => {
    console.log('✅ Redis connected')
    isConnected = true
  })

  try {
    await client.connect()
    isConnected = true
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message)
    console.log('⚠️ App will run without Redis caching')
    isConnected = false
  }

  return client
}

const getCache = async (key) => {
  try {
    const c = await getClient()
    if (!isConnected) return null
    const data = await c.get(key)
    return data ? JSON.parse(data) : null
  } catch (err) {
    console.error('Redis get error:', err.message)
    return null
  }
}

const setCache = async (key, data, ttlSeconds = 60) => {
  try {
    const c = await getClient()
    if (!isConnected) return
    await c.setEx(key, ttlSeconds, JSON.stringify(data))
    console.log(`✅ Cache set: ${key} (${ttlSeconds}s)`)
  } catch (err) {
    console.error('Redis set error:', err.message)
  }
}

const deleteCache = async (key) => {
  try {
    const c = await getClient()
    if (!isConnected) return
    await c.del(key)
    console.log(`🗑️ Cache deleted: ${key}`)
  } catch (err) {
    console.error('Redis delete error:', err.message)
  }
}

module.exports = { getClient, getCache, setCache, deleteCache }
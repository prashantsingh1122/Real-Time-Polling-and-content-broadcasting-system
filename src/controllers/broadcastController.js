const { User } = require('../models');
const { getActiveContent } = require('../services/schedulingService');
const { getCache, setCache } = require('../config/redis');

// GET /api/broadcast/live/:teacherId
exports.getLiveContent = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Check cache first
    const cacheKey = `broadcast:teacher:${teacherId}`
    const cached = await getCache(cacheKey)
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`)
      return res.json({ ...cached, fromCache: true })
    }
    console.log(`❌ Cache miss: ${cacheKey}`)

    const teacher = await User.findOne({
      where: { id: teacherId, role: 'teacher' },
      attributes: ['id', 'name', 'email']
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    const activeContent = await getActiveContent(teacherId);

    if (!activeContent || Object.keys(activeContent).length === 0) {
      return res.json({
        success: true,
        message: 'No content available',
        data: { teacher: teacher.name, content: null }
      });
    }

    const response = {
      success: true,
      message: 'Live content fetched successfully',
      data: {
        teacher: teacher.name,
        timestamp: new Date().toISOString(),
        content: activeContent
      }
    }

    // Store in cache for 60 seconds
    await setCache(cacheKey, response, 60)

    res.json(response)
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch live content'
    });
  }
};

// GET /api/broadcast/all - Public: all live content from all teachers
exports.getAllLiveContent = async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'broadcast:all'
    const cached = await getCache(cacheKey)
    if (cached) {
      console.log('✅ Cache hit: broadcast:all')
      return res.json({ ...cached, fromCache: true })
    }
    console.log('❌ Cache miss: broadcast:all')

    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'name', 'email']
    })

    const result = []
    for (const teacher of teachers) {
      const activeContent = await getActiveContent(teacher.id)
      if (activeContent && Object.keys(activeContent).length > 0) {
        result.push({
          teacher: { id: teacher.id, name: teacher.name },
          content: activeContent
        })
      }
    }

    const response = {
      success: true,
      total: result.length,
      data: result
    }

    // Store in cache for 60 seconds
    await setCache(cacheKey, response, 6000)

    res.json(response)
  } catch (error) {
    console.error('All live content error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// GET /api/broadcast/approved - All approved content
exports.getAllApprovedContent = async (req, res) => {
  try {
    const Content = require('../models/Content')

    const cacheKey = 'broadcast:approved'
    const cached = await getCache(cacheKey)
    if (cached) {
      console.log('✅ Cache hit: broadcast:approved')
      return res.json({ ...cached, fromCache: true })
    }

    const contents = await Content.findAll({
      where: { status: 'approved' },
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email']
      }],
      order: [['created_at', 'DESC']]
    })

    const response = {
      success: true,
      total: contents.length,
      data: contents
    }

    // Cache for 60 seconds
    await setCache(cacheKey, response, 60)

    res.json(response)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}
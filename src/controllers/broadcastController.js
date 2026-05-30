const { User } = require('../models');
const { getActiveContent } = require('../services/schedulingService');

// GET /api/broadcast/live/:teacherId
exports.getLiveContent = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Verify teacher exists
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

    // Get active content using scheduling logic
    const activeContent = await getActiveContent(teacherId);

    // Edge case: no content available
    if (!activeContent || Object.keys(activeContent).length === 0) {
      return res.json({
        success: true,
        message: 'No content available',
        data: {
          teacher: teacher.name,
          content: null
        }
      });
    }

    res.json({
      success: true,
      message: 'Live content fetched successfully',
      data: {
        teacher: teacher.name,
        timestamp: new Date().toISOString(),
        content: activeContent
      }
    });
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
    const { Op } = require('sequelize')
    const { User } = require('../models')
    const { getActiveContent } = require('../services/schedulingService')

    const now = new Date()

    // Get all teachers
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

    res.json({
      success: true,
      total: result.length,
      data: result
    })
  } catch (error) {
    console.error('All live content error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}
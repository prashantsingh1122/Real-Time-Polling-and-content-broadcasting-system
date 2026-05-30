
const { Content, User } = require('../models');

exports.uploadContent = async (req, res) => {
  try {
    const { title, description, subject, start_time, end_time, rotation_duration } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ 
        success: false,
        error: 'Title and subject are required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'File is required' 
      });
    }

    const validSubjects = ['maths', 'science', 'english', 'history'];
    if (!validSubjects.includes(subject.toLowerCase())) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid subject. Must be: maths, science, english, or history' 
      });
    }

    // Validate time window if provided
    if (start_time && end_time) {
      if (new Date(start_time) >= new Date(end_time)) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
      }
    }

    const content = await Content.create({
      title,
      description,
      subject: subject.toLowerCase(),
      file_url: req.file.location,
      file_path: req.file.key,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      start_time: start_time || null,
      end_time: end_time || null,
      rotation_duration: rotation_duration || 5,
      uploaded_by: req.user.id,
      status: 'pending'
    });
    // After Content.create(...)
const io = req.app.get('io')
if (io) {
  io.to('principal_room').emit('new_content_uploaded', {
    message: 'New content uploaded!'
  })
}

    res.status(201).json({
      success: true,
      message: 'Content uploaded successfully',
      data: {
        content: {
          id: content.id,
          title: content.title,
          subject: content.subject,
          file_url: content.file_url,
          status: content.status,
          start_time: content.start_time,
          end_time: content.end_time,
          rotation_duration: content.rotation_duration,
          created_at: content.created_at
        }
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Content upload failed' 
    });
  }
};

exports.getMyContent = async (req, res) => {
  try {
    const contents = await Content.findAll({
      where: { uploaded_by: req.user.id },
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['file_path'] }
    });

    res.json({ 
      success: true,
      count: contents.length,
      data: { contents }
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch content' 
    });
  }
};
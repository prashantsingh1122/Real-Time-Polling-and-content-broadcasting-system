const Content = require('../models/Content');

exports.getPendingContent = async (req, res) => {
  try {
    const contents = await Content.findAll({
      where: { status: 'pending' },
      order: [['created_at', 'DESC']]
    });

    res.json({ contents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllContent = async (req, res) => {
  try {
    const contents = await Content.findAll({
      order: [['created_at', 'DESC']]
    });

    res.json({ contents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveContent = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);

    if (!content) return res.status(404).json({ success: false, error: 'Content not found' });
    if (content.status !== 'pending') return res.status(400).json({ success: false, error: `Content is already ${content.status}` });

    content.status = 'approved';
    content.approved_by = req.user.id;
    content.approved_at = new Date();
    await content.save();

    // 🔔 Emit to teacher's room and public dashboard
    const io = req.app.get('io');
    if (io) {
      io.to(`teacher_${content.uploaded_by}`).emit('content_approved', {
        message: 'New content approved!',
        content: {
          id: content.id,
          title: content.title,
          subject: content.subject,
        }
      });
      io.to('public_dashboard').emit('content_updated', {
        message: 'Content updated!'
      });
    }

    res.json({ success: true, message: 'Content approved', data: { content } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.rejectContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }

    const content = await Content.findByPk(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (content.status !== 'pending') {
      return res.status(400).json({ error: 'Content already processed' });
    }

    content.status = 'rejected';
    content.rejection_reason = reason;
    content.approved_by = req.user.id;
    await content.save();

    res.json({ message: 'Content rejected', content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

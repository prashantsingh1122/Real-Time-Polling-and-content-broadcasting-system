const { Op } = require('sequelize');
const { Poll, Vote, User } = require('../models');
const { fn, col } = require('sequelize');

const buildPollWithVotes = async (poll) => {
  const counts = await Vote.findAll({
    where: { poll_id: poll.id },
    attributes: ['option_index', [fn('COUNT', col('id')), 'count']],
    group: ['option_index'],
    raw: true
  });
  const countMap = Object.fromEntries(counts.map(c => [c.option_index, parseInt(c.count)]));
  const totalVotes = Object.values(countMap).reduce((sum, n) => sum + n, 0);
  const voteCounts = poll.options.map((opt, i) => ({
    option: opt,
    votes: countMap[i] || 0
  }));

  const timeRemaining = poll.end_time
    ? Math.max(0, Math.floor((new Date(poll.end_time) - new Date()) / 1000))
    : null

  return {
    ...poll.toJSON(),
    vote_counts: voteCounts,
    total_votes: totalVotes,   // ✅ use the variable we already computed above
    time_remaining: timeRemaining
  };
};

// POST /api/polls - Teacher creates a poll
exports.createPoll = async (req, res) => {
  try {
    const { question, options, end_time, duration_minutes } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Question and at least 2 options are required'
      });
    }

    if (options.length > 6) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 6 options allowed'
      });
    }

    // Calculate end_time from duration_minutes if provided
    let pollEndTime = end_time ? new Date(end_time) : null
    if (duration_minutes) {
      pollEndTime = new Date(Date.now() + duration_minutes * 60 * 1000)
    }

    // Validate end_time is in future
    if (pollEndTime && pollEndTime <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'End time must be in the future'
      })
    }

    const poll = await Poll.create({
      question,
      options,
      teacher_id: req.user.id,
      end_time: pollEndTime,
      is_active: true
    });

    const timeRemaining = pollEndTime
      ? Math.floor((pollEndTime - new Date()) / 1000)
      : null

    const pollWithVotes = {
      ...poll.toJSON(),
      teacher: { id: req.user.id, name: req.user.name },
      vote_counts: poll.options.map(option => ({ option, votes: 0 })),
      total_votes: 0,
      time_remaining: timeRemaining
    };

    // Notify all students via WebSocket
    const io = req.app.get('io')
    if (io) {
      io.to('public_dashboard').emit('new_poll', { poll: pollWithVotes })
    }

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: { poll: pollWithVotes }
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/polls/my-polls - Teacher views own polls
exports.getMyPolls = async (req, res) => {
  try {
    const polls = await Poll.findAll({
      where: { teacher_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    const pollsWithVotes = await Promise.all(polls.map(buildPollWithVotes));

    res.json({
      success: true,
      count: polls.length,
      data: { polls: pollsWithVotes }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/polls/:id/toggle - Teacher activates/deactivates poll
exports.togglePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({
      where: { id: req.params.id, teacher_id: req.user.id }
    });

    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }

    await poll.update({ is_active: !poll.is_active });

    const io = req.app.get('io')
    if (io) {
      io.to('public_dashboard').emit('poll_updated', { pollId: poll.id, is_active: poll.is_active })
      io.to(`teacher_${req.user.id}`).emit('poll_updated', { pollId: poll.id, is_active: poll.is_active })
    }

    res.json({
      success: true,
      message: `Poll ${poll.is_active ? 'activated' : 'deactivated'}`,
      data: { poll }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/polls/:id - Teacher deletes poll
exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findOne({
      where: { id: req.params.id, teacher_id: req.user.id }
    });

    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }

    await Vote.destroy({ where: { poll_id: poll.id } });
    await poll.destroy();

    res.json({ success: true, message: 'Poll deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/polls/active - Public: get all active polls
exports.getActivePolls = async (req, res) => {
  try {
    const now = new Date()
    const polls = await Poll.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { end_time: null },
          { end_time: { [Op.gt]: now } }
        ]
      },
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']]
    })

    const pollsWithVotes = await Promise.all(polls.map(async (poll) => {
      const counts = await Vote.findAll({
        where: { poll_id: poll.id },
        attributes: ['option_index', [fn('COUNT', col('id')), 'count']],
        group: ['option_index'],
        raw: true
      })
      const countMap = Object.fromEntries(counts.map(c => [c.option_index, parseInt(c.count)]))
      const totalVotes = Object.values(countMap).reduce((sum, n) => sum + n, 0)
      const voteCounts = poll.options.map((opt, i) => ({
        option: opt,
        votes: countMap[i] || 0
      }))

      // Calculate time remaining in seconds
      const timeRemaining = poll.end_time
        ? Math.max(0, Math.floor((new Date(poll.end_time) - now) / 1000))
        : null

      return {
        ...poll.toJSON(),
        vote_counts: voteCounts,
        total_votes: totalVotes,
        time_remaining: timeRemaining  // seconds left
      }
    }))

    res.json({
      success: true,
      data: pollsWithVotes
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
// POST /api/polls/:id/vote - Public: student votes
exports.vote = async (req, res) => {
  try {
    const { option_index, voter_session } = req.body;
    const { id } = req.params;

    if (option_index === undefined || !voter_session) {
      return res.status(400).json({
        success: false,
        error: 'option_index and voter_session are required'
      });
    }

    const poll = await Poll.findByPk(id);
    if (!poll) return res.status(404).json({ success: false, error: 'Poll not found' });
    if (!poll.is_active) return res.status(400).json({ success: false, error: 'Poll is not active' });

    // Check if poll expired
    if (poll.end_time && new Date(poll.end_time) < new Date()) {
      await poll.update({ is_active: false })
      return res.status(400).json({ success: false, error: 'Poll has expired' })
    }

    if (option_index < 0 || option_index >= poll.options.length) {
      return res.status(400).json({ success: false, error: 'Invalid option' });
    }

    const existing = await Vote.findOne({ where: { poll_id: id, voter_session } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Already voted' });
    }

    await Vote.create({ poll_id: id, option_index, voter_session });

    const counts = await Vote.findAll({
      where: { poll_id: id },
      attributes: ['option_index', [fn('COUNT', col('id')), 'count']],
      group: ['option_index'],
      raw: true
    });
    const countMap = Object.fromEntries(counts.map(c => [c.option_index, parseInt(c.count)]));
    const totalVotes = Object.values(countMap).reduce((sum, n) => sum + n, 0);
    const voteCounts = poll.options.map((opt, i) => ({
      option: opt,
      votes: countMap[i] || 0
    }));

    const io = req.app.get('io')
    if (io) {
      io.to('public_dashboard').emit('vote_updated', {
        pollId: id,
        vote_counts: voteCounts,
        total_votes: totalVotes,
      })
      io.to(`teacher_${poll.teacher_id}`).emit('vote_updated', {
        pollId: id,
        vote_counts: voteCounts,
        total_votes: totalVotes,
      })
    }

    res.json({
      success: true,
      message: 'Vote recorded!',
      data: { vote_counts: voteCounts, total_votes: totalVotes }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
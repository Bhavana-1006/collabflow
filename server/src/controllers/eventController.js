const Event = require('../models/Event');
const Activity = require('../models/Activity');

// @desc Get events for calendar
// @route GET /api/events?workspaceId=...
exports.getEvents = async (req, res) => {
  try {
    const { workspaceId, projectId, start, end } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspaceId is required' });
    }

    const filter = { workspace: workspaceId };
    if (projectId) filter.project = projectId;
    if (start && end) {
      filter.start = { $gte: new Date(start) };
      filter.end = { $lte: new Date(end) };
    }

    const events = await Event.find(filter)
      .populate('user', 'name email avatar')
      .populate('attendees', 'name email avatar position')
      .populate('project', 'name color')
      .sort({ start: 1 });

    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create event
// @route POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { workspaceId, projectId, title, description, start, end, allDay, type, attendees, color } = req.body;

    if (!workspaceId || !title || !start || !end) {
      return res.status(400).json({ success: false, message: 'workspaceId, title, start, and end are required' });
    }

    const event = await Event.create({
      workspace: workspaceId,
      project: projectId || null,
      user: req.user._id,
      title,
      description: description || '',
      start: new Date(start),
      end: new Date(end),
      allDay: Boolean(allDay),
      type: type || 'meeting',
      attendees: attendees || [req.user._id],
      color: color || '#6366f1',
    });

    await Activity.create({
      workspace: workspaceId,
      project: projectId || null,
      user: req.user._id,
      action: `scheduled event "${title}"`,
      entityType: 'event',
      entityId: event._id,
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('user', 'name email avatar')
      .populate('attendees', 'name email avatar position')
      .populate('project', 'name color');

    res.status(201).json({ success: true, event: populatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update event
// @route PUT /api/events/:eventId
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.eventId, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email avatar')
      .populate('attendees', 'name email avatar position')
      .populate('project', 'name color');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete event
// @route DELETE /api/events/:eventId
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

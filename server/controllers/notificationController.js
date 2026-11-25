const Notification = require('../models/Notification');
const { addConnection } = require('../services/notificationService');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientEmail: req.user.email.toLowerCase(),
      recipientRole: req.user.role,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      data: notifications.map((notification) => ({
        ...notification,
        id: notification._id.toString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

exports.streamNotifications = (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  res.write('retry: 3000\n\n');

  const removeConnection = addConnection(req.user, res);
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(': keep-alive\n\n');
  }, 25000);

  res.on('close', () => {
    clearInterval(heartbeat);
    removeConnection();
  });
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientEmail: req.user.email.toLowerCase(),
        recipientRole: req.user.role,
      },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipientEmail: req.user.email.toLowerCase(),
        recipientRole: req.user.role,
        read: false,
      },
      { $set: { read: true } }
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};

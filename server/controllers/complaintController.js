const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { analyzeCampusComplaint } = require('../services/geminiService');
const { createNotification } = require('../services/notificationService');

const complaintLookup = (id) => ({
  $or: [
    { ticketId: id },
    { _id: mongoose.isValidObjectId(id) ? id : null },
  ],
});

const complaintResponse = (complaint) => ({
  ...complaint.toObject(),
  id: complaint.ticketId,
});

const deliverNotifications = async (notifications) => {
  const results = await Promise.allSettled(notifications.map(createNotification));
  const failures = results.filter((result) => result.status === 'rejected');
  failures.forEach((result) => console.error('Notification delivery failed:', result.reason));
  return failures.length
    ? 'The complaint was saved, but one or more in-app notifications could not be delivered.'
    : '';
};

const userCanViewComplaint = (complaint, user) => {
  if (user.role === 'admin') return true;
  if (user.role === 'student') {
    return complaint.student?.email?.toLowerCase() === user.email?.toLowerCase();
  }
  if (user.role === 'staff') {
    return (
      complaint.status !== 'Pending Review' &&
      complaint.status !== 'Rejected' &&
      complaint.assignedStaff?.email?.toLowerCase() === user.email?.toLowerCase()
    );
  }
  return false;
};

exports.getComplaints = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query['student.email'] = req.user.email.toLowerCase();
    } else if (req.user.role === 'staff') {
      query['assignedStaff.email'] = req.user.email.toLowerCase();
      query.status = { $nin: ['Pending Review', 'Rejected'] };
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You cannot view complaints' });
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (category && category !== 'ALL') {
      query.category = category;
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints.map(complaintResponse),
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff', status: 'active' })
      .select('name email userId department specialization phone avatar activeComplaints completedComplaints rating status')
      .sort({ name: 1 })
      .lean();
    return res.json({
      success: true,
      data: staff.map((member) => ({ ...member, id: member.userId })),
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch staff' });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne(complaintLookup(req.params.id));
    if (!complaint || !userCanViewComplaint(complaint, req.user)) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    return res.status(200).json({ success: true, data: complaintResponse(complaint) });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch complaint' });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category = 'Other',
      location = 'Campus Premises',
      isAiDetected = true,
      priority = 'Medium',
      imageUrl,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Complaint title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Complaint description is required' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, message: 'Campus location is required' });
    }
    if (title.trim().length > 200 || description.trim().length > 8000) {
      return res.status(400).json({
        success: false,
        message: 'The title or description exceeds the allowed length.',
      });
    }

    const student = await User.findById(req.user.id).select(
      'name email userId rollNo department avatar role'
    );
    if (!student || student.role !== 'student') {
      return res.status(401).json({ success: false, message: 'Student account is unavailable' });
    }

    const analysis = await analyzeCampusComplaint(title.trim(), description.trim());
    if (!analysis.isCampusRelated || analysis.isPotentiallySpam) {
      return res.status(400).json({
        success: false,
        message: analysis.explanation || 'This complaint may be unrelated or spam. Please review it.',
        analysis,
      });
    }

    const allowedCategories = [
      'Electrical',
      'Plumbing',
      'WiFi / Internet',
      'Cleanliness',
      'Infrastructure',
      'Hostel',
      'Classroom',
      'Security',
      'Transport',
      'Other',
    ];
    const resolvedCategory = isAiDetected === false && allowedCategories.includes(category)
      ? category
      : analysis.category;

    const admins = await User.find({ role: 'admin', status: 'active' }).select('email').lean();
    const count = await Complaint.countDocuments();
    const ticketId = `CR-${1041 + count}`;
    const now = new Date();
    const timeline = [
      {
        stage: 'Pending Review',
        timestamp: now.toISOString(),
        note: 'Complaint submitted and waiting for administrator review',
        completed: true,
      },
      { stage: 'Assigned', timestamp: null, note: 'Awaiting administrator approval', completed: false },
      { stage: 'In Progress', timestamp: null, note: 'Pending', completed: false },
      { stage: 'Resolved', timestamp: null, note: 'Pending', completed: false },
      { stage: 'Verified', timestamp: null, note: 'Pending', completed: false },
    ];

    const complaint = await Complaint.create({
      ticketId,
      title: title.trim(),
      description: description.trim(),
      category: resolvedCategory,
      location: location.trim(),
      isAiDetected,
      status: 'Pending Review',
      priority,
      student: {
        id: student.userId,
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        department: student.department,
        avatar: student.avatar,
      },
      imageUrl: imageUrl || null,
      timeline,
      remarks: [],
      feedback: null,
    });

    const notificationWarning = admins.length
      ? await deliverNotifications(
          admins.map((admin) => ({
            recipientEmail: admin.email,
            recipientRole: 'admin',
            title: 'Complaint needs review',
            message: `#${ticketId}: ${complaint.title} was submitted and is waiting for your review.`,
            type: 'warning',
            link: '/admin/complaints',
            complaintId: ticketId,
          }))
        )
      : 'No active administrator account is configured to receive notifications.';

    return res.status(201).json({
      success: true,
      message: `Complaint #${ticketId} submitted for administrator review.`,
      data: complaintResponse(complaint),
      ...(notificationWarning ? { warning: notificationWarning } : {}),
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.publicMessage || error.message || 'Failed to create complaint.',
    });
  }
};

exports.reviewComplaint = async (req, res) => {
  try {
    const { decision, note = '' } = req.body;
    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be approve or reject' });
    }
    if (typeof note !== 'string' || note.length > 1000) {
      return res.status(400).json({ success: false, message: 'Review note must be 1000 characters or fewer' });
    }

    const now = new Date();
    const approved = decision === 'approve';
    const status = approved ? 'Pending' : 'Rejected';
    const reviewMessage = approved
      ? `Approved by administrator${note.trim() ? `: ${note.trim()}` : ''}`
      : `Rejected by administrator${note.trim() ? `: ${note.trim()}` : ''}`;
    const complaint = await Complaint.findOneAndUpdate(
      {
        ...complaintLookup(req.params.id),
        status: 'Pending Review',
        'timeline.stage': 'Pending Review',
      },
      {
        $set: {
          status,
          reviewNote: note.trim(),
          reviewedBy: req.user.email,
          reviewedAt: now,
          'timeline.$.timestamp': now.toISOString(),
          'timeline.$.note': reviewMessage,
          'timeline.$.completed': true,
        },
      },
      { new: true, runValidators: true }
    );
    if (!complaint) {
      const exists = await Complaint.exists(complaintLookup(req.params.id));
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists ? 'This complaint has already been reviewed' : 'Complaint not found',
      });
    }

    const notificationWarning = await deliverNotifications([{
      recipientEmail: complaint.student?.email,
      recipientRole: 'student',
      title: approved ? 'Complaint approved' : 'Complaint not approved',
      message: approved
        ? `Your complaint #${complaint.ticketId} was approved and is awaiting staff assignment.`
        : `Your complaint #${complaint.ticketId} was not approved.${note.trim() ? ` Reason: ${note.trim()}` : ''}`,
      type: approved ? 'success' : 'warning',
      link: `/student/complaints/${complaint.ticketId}`,
      complaintId: complaint.ticketId,
    }]);

    return res.json({
      success: true,
      data: complaintResponse(complaint),
      ...(notificationWarning ? { warning: notificationWarning } : {}),
    });
  } catch (error) {
    console.error('Error reviewing complaint:', error);
    return res.status(500).json({ success: false, message: 'Failed to review complaint' });
  }
};

exports.assignComplaint = async (req, res) => {
  try {
    const { staffEmail, note = '' } = req.body;
    if (typeof staffEmail !== 'string' || !staffEmail.trim()) {
      return res.status(400).json({ success: false, message: 'A staff member must be selected' });
    }
    if (typeof note !== 'string' || note.length > 1000) {
      return res.status(400).json({ success: false, message: 'Assignment note must be 1000 characters or fewer' });
    }

    const staff = await User.findOne({
      email: staffEmail.trim().toLowerCase(),
      role: 'staff',
      status: 'active',
    }).select('name email userId department specialization phone avatar');
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Selected active staff account was not found' });
    }

    const now = new Date().toISOString();
    const complaint = await Complaint.findOneAndUpdate(
      {
        ...complaintLookup(req.params.id),
        status: 'Pending',
        'timeline.stage': 'Assigned',
      },
      {
        $set: {
          status: 'Assigned',
          assignedStaff: {
            id: staff.userId,
            name: staff.name,
            email: staff.email,
            department: staff.department,
            specialization: staff.specialization,
            phone: staff.phone,
            avatar: staff.avatar,
          },
          'timeline.$.timestamp': now,
          'timeline.$.note': `Assigned to ${staff.name}${note.trim() ? `: ${note.trim()}` : ''}`,
          'timeline.$.completed': true,
        },
        ...(note.trim()
          ? {
              $push: {
                remarks: {
                  author: 'Campus Administrator',
                  authorRole: 'Admin',
                  text: `Assignment instruction: ${note.trim()}`,
                  timestamp: now,
                },
              },
            }
          : {}),
      },
      { new: true, runValidators: true }
    );
    if (!complaint) {
      const exists = await Complaint.exists(complaintLookup(req.params.id));
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists
          ? 'Only administrator-approved, unassigned complaints can be assigned'
          : 'Complaint not found',
      });
    }

    const notificationWarning = await deliverNotifications([
      {
        recipientEmail: staff.email,
        recipientRole: 'staff',
        title: 'New complaint assigned',
        message: `#${complaint.ticketId}: ${complaint.title} has been assigned to you.`,
        type: 'info',
        link: '/staff/assigned',
        complaintId: complaint.ticketId,
      },
      {
        recipientEmail: complaint.student?.email,
        recipientRole: 'student',
        title: 'Complaint assigned',
        message: `Your complaint #${complaint.ticketId} has been assigned to ${staff.name}.`,
        type: 'info',
        link: `/student/complaints/${complaint.ticketId}`,
        complaintId: complaint.ticketId,
      },
    ]);

    return res.json({
      success: true,
      data: complaintResponse(complaint),
      ...(notificationWarning ? { warning: notificationWarning } : {}),
    });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign complaint' });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can update complaint records' });
    }
    const complaint = await Complaint.findOneAndUpdate(
      complaintLookup(req.params.id),
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    return res.status(200).json({ success: true, data: complaintResponse(complaint) });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return res.status(500).json({ success: false, message: 'Failed to update complaint' });
  }
};

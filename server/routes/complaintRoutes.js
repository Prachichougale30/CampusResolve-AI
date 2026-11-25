const express = require('express');
const {
  getComplaints,
  getStaff,
  getComplaintById,
  createComplaint,
  reviewComplaint,
  assignComplaint,
  updateComplaint,
} = require('../controllers/complaintController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getComplaints);
router.post('/', protect, restrictTo('student'), createComplaint);
router.get('/staff', protect, restrictTo('admin'), getStaff);
router.patch('/:id/review', protect, restrictTo('admin'), reviewComplaint);
router.patch('/:id/assign', protect, restrictTo('admin'), assignComplaint);
router.get('/:id', protect, getComplaintById);
router.patch('/:id', protect, updateComplaint);

module.exports = router;

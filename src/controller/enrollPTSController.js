const EnrollPTS = require('../models/EnrollPTS');
const PhysicalTraining = require('../models/PhysicalTraining');
const User = require('../models/User');

/**
 * Enroll a student in a physical training session
 * @route POST /api/enroll-pts
 * @access Private (Student)
 */
exports.enrollStudent = async (req, res) => {
  try {
    const { sessionID } = req.body;
    const userID = req.user.id; // From auth middleware
    
    // Validate input
    if (!sessionID) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ userID });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if session exists
    const session = await PhysicalTraining.findOne({ sessionID });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Physical training session not found'
      });
    }
    
    // Check if session is pending
    if (session.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in a completed session'
      });
    }
    
    // Check if session has available slots
    if (session.currentCount >= session.maxCount) {
      return res.status(400).json({
        success: false,
        message: 'Session is full'
      });
    }
    
    // Check if user is already enrolled
    const existingEnrollment = await EnrollPTS.findOne({ userID, sessionID });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this session'
      });
    }
    
    // Create enrollment
    const enrollment = new EnrollPTS({
      userID,
      sessionID,
      status: 'pending',
      date: new Date()
    });
    
    await enrollment.save();
    
    // Update session currentCount
    await PhysicalTraining.findOneAndUpdate(
      { sessionID },
      { $inc: { currentCount: 1 } }
    );
    
    return res.status(201).json({
      success: true,
      message: 'Successfully enrolled in physical training session',
      enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to enroll in session',
      error: error.message
    });
  }
};

/**
 * Get all enrollments
 * @route GET /api/enroll-pts
 * @access Private (Admin)
 */
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await EnrollPTS.find();
    
    return res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    console.error('Get all enrollments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollments',
      error: error.message
    });
  }
};

/**
 * Get enrollments by user ID
 * @route GET /api/enroll-pts/user/:userId
 * @access Private (Admin/Student - own enrollments)
 */
exports.getEnrollmentsByUser = async (req, res) => {
  try {
    const userID = req.params.userId;
    
    // Check if the requesting user is the same as the user ID or is an admin
    if (req.user.id !== userID && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const enrollments = await EnrollPTS.find({ userID });
    
    // Get detailed session information for each enrollment
    const detailedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const session = await PhysicalTraining.findOne({ sessionID: enrollment.sessionID });
        return {
          ...enrollment.toObject(),
          sessionDetails: session
        };
      })
    );
    
    return res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments: detailedEnrollments
    });
  } catch (error) {
    console.error('Get enrollments by user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollments',
      error: error.message
    });
  }
};

/**
 * Get enrollments by session ID
 * @route GET /api/enroll-pts/session/:sessionId
 * @access Private (Admin/Instructor)
 */
exports.getEnrollmentsBySession = async (req, res) => {
  try {
    const sessionID = req.params.sessionId;
    
    const enrollments = await EnrollPTS.find({ sessionID });
    
    // Get user details for each enrollment
    const detailedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await User.findOne({ userID: enrollment.userID }).select('-password');
        return {
          ...enrollment.toObject(),
          userDetails: user
        };
      })
    );
    
    return res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments: detailedEnrollments
    });
  } catch (error) {
    console.error('Get enrollments by session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollments',
      error: error.message
    });
  }
};

/**
 * Update enrollment status
 * @route PATCH /api/enroll-pts/:id
 * @access Private (Admin/Instructor)
 */
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const enrollmentId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['pending', 'completed', 'absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (pending/completed/absent) is required'
      });
    }
    
    const enrollment = await EnrollPTS.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    enrollment.status = status;
    await enrollment.save();
    
    return res.status(200).json({
      success: true,
      message: `Enrollment status updated to "${status}"`,
      enrollment
    });
  } catch (error) {
    console.error('Update enrollment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update enrollment status',
      error: error.message
    });
  }
};

/**
 * Cancel/delete enrollment
 * @route DELETE /api/enroll-pts/:id
 * @access Private (Admin/Student - own enrollment)
 */
exports.cancelEnrollment = async (req, res) => {
  try {
    const enrollmentId = req.params.id;
    
    const enrollment = await EnrollPTS.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check if the requesting user is the enrolled student or an admin
    if (req.user.id !== enrollment.userID && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Get the session to check its status
    const session = await PhysicalTraining.findOne({ sessionID: enrollment.sessionID });
    if (session && session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel enrollment for a completed session'
      });
    }
    
    await EnrollPTS.findByIdAndDelete(enrollmentId);
    
    // Update session currentCount
    if (session) {
      await PhysicalTraining.findOneAndUpdate(
        { sessionID: enrollment.sessionID },
        { $inc: { currentCount: -1 } }
      );
    }
    
    return res.status(200).json({
      success: true,
      message: 'Enrollment canceled successfully'
    });
  } catch (error) {
    console.error('Cancel enrollment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel enrollment',
      error: error.message
    });
  }
};

/**
 * Get enrollment by ID
 * @route GET /api/enroll-pts/:id
 * @access Private (Admin/Student - own enrollment)
 */
exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollmentId = req.params.id;
    
    const enrollment = await EnrollPTS.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check if the requesting user is the enrolled student or an admin
    if (req.user.id !== enrollment.userID && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Get session details
    const session = await PhysicalTraining.findOne({ sessionID: enrollment.sessionID });
    
    return res.status(200).json({
      success: true,
      enrollment: {
        ...enrollment.toObject(),
        sessionDetails: session
      }
    });
  } catch (error) {
    console.error('Get enrollment by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollment',
      error: error.message
    });
  }
};

/**
 * Get counts of enrollments by status
 * @route GET /api/enroll-pts/stats
 * @access Private (Admin)
 */
exports.getEnrollmentStats = async (req, res) => {
  try {
    const stats = await EnrollPTS.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const formattedStats = {
      pending: 0,
      completed: 0,
      absent: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });
    
    return res.status(200).json({
      success: true,
      stats: formattedStats
    });
  } catch (error) {
    console.error('Get enrollment stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollment statistics',
      error: error.message
    });
  }
};
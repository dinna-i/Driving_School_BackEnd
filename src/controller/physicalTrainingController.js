const PhysicalTraining = require('../models/PhysicalTraining');
const Vehicle = require('../models/Vehicle');
const Instructor = require('../models/Instructor');
const Counter = require('../models/Counter');

/**
 * Get next sequence value for session ID
 */
const getNextSequenceValue = async (sequenceName) => {
  const counter = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return `PT${String(counter.value).padStart(4, '0')}`;
};

/**
 * Create a new physical training session
 * @route POST /api/physical-training
 * @access Private (Admin/Instructor)
 */
exports.createPhysicalTraining = async (req, res) => {
  try {
    const { 
      date, 
      time, 
      location, 
      vehicleID, 
      instructorID, 
      maxCount, 
      instructorQualification 
    } = req.body;

    // Validate input
    if (!date || !time || !location || !vehicleID || !instructorID || !maxCount) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate vehicle exists
    const vehicle = await Vehicle.findOne({ vehicleID });
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Validate instructor exists
    const instructor = await Instructor.findOne({ InstructorID: instructorID });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Generate auto-incremented session ID
    const sessionID = await getNextSequenceValue('sessionID');

    // Create new training session
    const newSession = new PhysicalTraining({
      sessionID,
      date,
      time,
      location,
      vehicleID,
      instructorID,
      maxCount,
      currentCount: 0,
      status: 'pending',
      instructorQualification
    });

    await newSession.save();

    return res.status(201).json({
      success: true,
      message: 'Physical training session created successfully',
      session: newSession
    });
  } catch (error) {
    console.error('Create physical training error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create physical training session',
      error: error.message
    });
  }
};

/**
 * Get all physical training sessions
 * @route GET /api/physical-training
 * @access Public
 */
exports.getAllPhysicalTrainings = async (req, res) => {
  try {
    const sessions = await PhysicalTraining.find();
    
    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error('Get all physical trainings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve physical training sessions',
      error: error.message
    });
  }
};

/**
 * Get physical training session by ID
 * @route GET /api/physical-training/:id
 * @access Public
 */
exports.getPhysicalTrainingById = async (req, res) => {
  try {
    const sessionID = req.params.id;
    
    const session = await PhysicalTraining.findOne({ sessionID });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Physical training session not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get physical training by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve physical training session',
      error: error.message
    });
  }
};

/**
 * Update physical training session
 * @route PUT /api/physical-training/:id
 * @access Private (Admin/Instructor)
 */
exports.updatePhysicalTraining = async (req, res) => {
  try {
    const sessionID = req.params.id;
    const { 
      date, 
      time, 
      location, 
      vehicleID, 
      instructorID, 
      maxCount, 
      status,
      currentCount,
      instructorQualification 
    } = req.body;
    
    // Validate input - at least one field should be provided
    if (!date && !time && !location && !vehicleID && !instructorID && 
        maxCount === undefined && !status && currentCount === undefined && !instructorQualification) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update'
      });
    }
    
    // Check if session exists
    const existingSession = await PhysicalTraining.findOne({ sessionID });
    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: 'Physical training session not found'
      });
    }
    
    // Validate references if provided
    if (vehicleID) {
      const vehicle = await Vehicle.findOne({ vehicleID });
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }
    }
    
    if (instructorID) {
      const instructor = await Instructor.findOne({ InstructorID: instructorID });
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found'
        });
      }
    }
    
    // Validate status if provided
    if (status && !['pending', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "pending" or "completed"'
      });
    }
    
    // Validate currentCount if provided
    if (currentCount !== undefined) {
      const newMaxCount = maxCount !== undefined ? maxCount : existingSession.maxCount;
      if (currentCount > newMaxCount) {
        return res.status(400).json({
          success: false,
          message: 'Current count cannot exceed max count'
        });
      }
    }
    
    // Update session
    const updateData = {};
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (location) updateData.location = location;
    if (vehicleID) updateData.vehicleID = vehicleID;
    if (instructorID) updateData.instructorID = instructorID;
    if (maxCount !== undefined) updateData.maxCount = maxCount;
    if (status) updateData.status = status;
    if (currentCount !== undefined) updateData.currentCount = currentCount;
    if (instructorQualification) updateData.instructorQualification = instructorQualification;
    
    const updatedSession = await PhysicalTraining.findOneAndUpdate(
      { sessionID },
      updateData,
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Physical training session updated successfully',
      session: updatedSession
    });
  } catch (error) {
    console.error('Update physical training error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update physical training session',
      error: error.message
    });
  }
};

/**
 * Delete physical training session
 * @route DELETE /api/physical-training/:id
 * @access Private (Admin)
 */
exports.deletePhysicalTraining = async (req, res) => {
  try {
    const sessionID = req.params.id;
    
    // Check if session exists
    const session = await PhysicalTraining.findOne({ sessionID });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Physical training session not found'
      });
    }
    
    // Check if session has enrolled users
    if (session.currentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete session with enrolled users'
      });
    }
    
    // Delete session
    await PhysicalTraining.findOneAndDelete({ sessionID });
    
    return res.status(200).json({
      success: true,
      message: 'Physical training session deleted successfully'
    });
  } catch (error) {
    console.error('Delete physical training error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete physical training session',
      error: error.message
    });
  }
};

/**
 * Get available physical training sessions
 * @route GET /api/physical-training/available
 * @access Public
 */
exports.getAvailableSessions = async (req, res) => {
  try {
    const sessions = await PhysicalTraining.find({
      status: 'pending',
      $expr: { $lt: ["$currentCount", "$maxCount"] }
    });
    
    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error('Get available sessions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve available sessions',
      error: error.message
    });
  }
};

/**
 * Get physical training sessions by instructor
 * @route GET /api/physical-training/instructor/:id
 * @access Public
 */
exports.getSessionsByInstructor = async (req, res) => {
  try {
    const instructorID = req.params.id;
    
    // Validate instructor exists
    const instructor = await Instructor.findOne({ InstructorID: instructorID });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    const sessions = await PhysicalTraining.find({ instructorID });
    
    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error('Get sessions by instructor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sessions by instructor',
      error: error.message
    });
  }
};

/**
 * Get physical training sessions by date range
 * @route GET /api/physical-training/date-range
 * @access Public
 */
exports.getSessionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const sessions = await PhysicalTraining.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
    
    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error('Get sessions by date range error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sessions by date range',
      error: error.message
    });
  }
};

/**
 * Update session status
 * @route PATCH /api/physical-training/:id/status
 * @access Private (Admin/Instructor)
 */
exports.updateSessionStatus = async (req, res) => {
  try {
    const sessionID = req.params.id;
    const { status } = req.body;
    
    if (!status || !['pending', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (pending/completed) is required'
      });
    }
    
    const session = await PhysicalTraining.findOne({ sessionID });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Physical training session not found'
      });
    }
    
    const updatedSession = await PhysicalTraining.findOneAndUpdate(
      { sessionID },
      { status },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: `Session status updated to "${status}"`,
      session: updatedSession
    });
  } catch (error) {
    console.error('Update session status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update session status',
      error: error.message
    });
  }
};
const Instructor = require('../models/Instructor');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new instructor
 * @route POST /api/instructors
 * @access Private (Admin)
 */
exports.createInstructor = async (req, res) => {
  try {
    const { InstructorName, email, InstructorLocation, InstructorExperience, password } = req.body;

    // Validate input
    if (!InstructorName || !email || !InstructorLocation || !InstructorExperience || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if instructor email already exists
    const existingInstructor = await Instructor.findOne({ email });
    if (existingInstructor) {
      return res.status(400).json({
        success: false,
        message: 'Instructor with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new instructor
    const newInstructor = new Instructor({
      InstructorID: uuidv4(),
      InstructorName,
      email,
      InstructorLocation,
      InstructorExperience,
      password: hashedPassword,
      isInstructor: true
    });

    await newInstructor.save();

    // Remove password from response
    const instructorResponse = { ...newInstructor.toObject() };
    delete instructorResponse.password;

    return res.status(201).json({
      success: true,
      message: 'Instructor created successfully',
      instructor: instructorResponse
    });
  } catch (error) {
    console.error('Create instructor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create instructor',
      error: error.message
    });
  }
};

/**
 * Get all instructors
 * @route GET /api/instructors
 * @access Public
 */
exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().select('-password');
    
    return res.status(200).json({
      success: true,
      count: instructors.length,
      instructors
    });
  } catch (error) {
    console.error('Get all instructors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve instructors',
      error: error.message
    });
  }
};

/**
 * Get instructor by ID
 * @route GET /api/instructors/:id
 * @access Public
 */
exports.getInstructorById = async (req, res) => {
  try {
    const instructorID = req.params.id;
    
    const instructor = await Instructor.findOne({ InstructorID: instructorID }).select('-password');
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      instructor
    });
  } catch (error) {
    console.error('Get instructor by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve instructor',
      error: error.message
    });
  }
};

/**
 * Update instructor
 * @route PUT /api/instructors/:id
 * @access Private (Admin/Instructor)
 */
exports.updateInstructor = async (req, res) => {
  try {
    const instructorID = req.params.id;
    const { InstructorName, email, InstructorLocation, InstructorExperience, password } = req.body;
    
    // Validate input
    if (!InstructorName && !email && !InstructorLocation && InstructorExperience === undefined && !password) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update'
      });
    }
    
    // Check if instructor exists
    const existingInstructor = await Instructor.findOne({ InstructorID: instructorID });
    if (!existingInstructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    // Check if email is being updated and is unique
    if (email && email !== existingInstructor.email) {
      const duplicateEmail = await Instructor.findOne({ email });
      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another instructor'
        });
      }
    }
    
    // Prepare update object
    const updateData = {};
    if (InstructorName) updateData.InstructorName = InstructorName;
    if (email) updateData.email = email;
    if (InstructorLocation) updateData.InstructorLocation = InstructorLocation;
    if (InstructorExperience !== undefined) updateData.InstructorExperience = InstructorExperience;
    
    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update instructor
    const updatedInstructor = await Instructor.findOneAndUpdate(
      { InstructorID: instructorID },
      updateData,
      { new: true }
    ).select('-password');
    
    return res.status(200).json({
      success: true,
      message: 'Instructor updated successfully',
      instructor: updatedInstructor
    });
  } catch (error) {
    console.error('Update instructor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update instructor',
      error: error.message
    });
  }
};

/**
 * Delete instructor
 * @route DELETE /api/instructors/:id
 * @access Private (Admin)
 */
exports.deleteInstructor = async (req, res) => {
  try {
    const instructorID = req.params.id;
    
    // Check if instructor exists
    const instructor = await Instructor.findOne({ InstructorID: instructorID });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    // Delete instructor
    await Instructor.findOneAndDelete({ InstructorID: instructorID });
    
    return res.status(200).json({
      success: true,
      message: 'Instructor deleted successfully'
    });
  } catch (error) {
    console.error('Delete instructor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete instructor',
      error: error.message
    });
  }
};

/**
 * Get instructors by location
 * @route GET /api/instructors/location/:location
 * @access Public
 */
exports.getInstructorsByLocation = async (req, res) => {
  try {
    const location = req.params.location;
    
    const instructors = await Instructor.find({ 
      InstructorLocation: { $regex: new RegExp(location, 'i') } 
    }).select('-password');
    
    return res.status(200).json({
      success: true,
      count: instructors.length,
      instructors
    });
  } catch (error) {
    console.error('Get instructors by location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve instructors by location',
      error: error.message
    });
  }
};

/**
 * Get instructors by experience level
 * @route GET /api/instructors/experience/:years
 * @access Public
 */
exports.getInstructorsByExperience = async (req, res) => {
  try {
    const years = parseInt(req.params.years);
    
    if (isNaN(years)) {
      return res.status(400).json({
        success: false,
        message: 'Valid years of experience required'
      });
    }
    
    const instructors = await Instructor.find({ 
      InstructorExperience: { $gte: years } 
    }).select('-password');
    
    return res.status(200).json({
      success: true,
      count: instructors.length,
      instructors
    });
  } catch (error) {
    console.error('Get instructors by experience error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve instructors by experience',
      error: error.message
    });
  }
};

/**
 * Instructor login
 * @route POST /api/instructors/login
 * @access Public
 */
exports.instructorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find instructor by email
    const instructor = await Instructor.findOne({ email });
    if (!instructor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, instructor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token (assuming you have the same JWT setup as in authController)
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
    
    const token = jwt.sign(
      { 
        id: instructor.InstructorID, 
        email: instructor.email,
        name: instructor.InstructorName,
        isInstructor: true
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const instructorResponse = { ...instructor.toObject() };
    delete instructorResponse.password;

    // Set cookie and return response
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      instructor: instructorResponse,
      token
    });
  } catch (error) {
    console.error('Instructor login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};


const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const JWT_EXPIRES_IN = '24h';

// Register a new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, password, email, phoneNumber, address, gender, isStudent } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
       email
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      userID: uuidv4(),
      firstName,
      lastName,
      username,
      password: hashedPassword,
      email,
      phoneNumber,
      address,
      gender,
      isStudent: isStudent !== undefined ? isStudent : true
    });

    // Save user to database
    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.userID, email: newUser.email, username: newUser.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send response
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.userID, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.user.id });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get current user',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
    try {
        const { firstName, lastName, username, email, phoneNumber, address, gender } = req.body;
        const userId = req.user.id; // Get user ID from the authenticated user
        
        // Validate input
        if (!firstName && !lastName && !username && !email && !phoneNumber && !address && !gender) {
            return res.status(400).json({
                success: false,
                message: 'At least one field is required to update'
            });
        }

        // Check if username or email is being updated and ensure they are unique
        if (username || email) {
            const existingUser = await User.findOne({
                $and: [
                    { userID: { $ne: userId } }, // Not the current user
                    { 
                        $or: [
                            ...(username ? [{ username }] : []),
                            ...(email ? [{ email }] : [])
                        ] 
                    }
                ]
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }
        }

        // Find user and update
        const updatedUser = await User.findOneAndUpdate(
            { userID: userId },
            {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(username && { username }),
                ...(email && { email }),
                ...(phoneNumber && { phoneNumber }),
                ...(address && { address }),
                ...(gender && { gender })
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove password from response
        const userResponse = { ...updatedUser.toObject() };
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: userResponse
        });
    } catch (err) {
        console.error('Update user error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: err.message
        });
    }
}
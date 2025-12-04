const jwt = require('jsonwebtoken');

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

/**
 * Middleware to authenticate JWT token
 */
exports.authenticate = (req, res, next) => {
  // Get token from cookie or Authorization header
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};
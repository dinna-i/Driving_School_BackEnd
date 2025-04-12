/**
 * Middleware to check if user is an instructor
 */
exports.isInstructor = (req, res, next) => {
    if (req.user && req.user.isInstructor) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Instructor role required.'
      });
    }
  };
  
  /**
   * Middleware to check if user is a student
   */
  exports.isStudent = (req, res, next) => {
    if (req.user && req.user.isStudent) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student role required.'
      });
    }
  };
  
  /**
   * Middleware to check if user is an admin
   * Note: You'll need to add the isAdmin field to your User model
   */
  exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator role required.'
      });
    }
  };
  
  /**
   * Middleware to check if the user is the instructor with the given ID
   * or an admin
   */
  exports.isInstructorOrAdmin = (req, res, next) => {
    if (
      (req.user && req.user.isInstructor && req.user.id === req.params.id) || 
      (req.user && req.user.isAdmin)
    ) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.'
      });
    }
  };
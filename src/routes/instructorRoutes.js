const express = require('express');
const router = express.Router();
const instructorController = require('../controller/instructorController');
const { authenticate } = require('../middleware/authMiddleware');

// Login route
router.post('/login', instructorController.instructorLogin);

// Public routes
router.get('/', instructorController.getAllInstructors);
router.get('/:id', instructorController.getInstructorById);
router.get('/location/:location', instructorController.getInstructorsByLocation);
router.get('/experience/:years', instructorController.getInstructorsByExperience);

// Protected routes
router.post('/', authenticate, instructorController.createInstructor);
router.put('/:id', authenticate, instructorController.updateInstructor);
router.delete('/:id', authenticate, instructorController.deleteInstructor);

module.exports = router;
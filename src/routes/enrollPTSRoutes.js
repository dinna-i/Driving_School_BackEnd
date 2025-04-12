const express = require('express');
const router = express.Router();
const enrollPTSController = require('../controller/enrollPTSController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin, isInstructor, isStudent } = require('../middleware/checkRole');

// Routes that require authentication
router.post('/', authenticate, isStudent, enrollPTSController.enrollStudent);
router.get('/', authenticate, isAdmin, enrollPTSController.getAllEnrollments);
router.get('/user/:userId', authenticate, enrollPTSController.getEnrollmentsByUser);
router.get('/session/:sessionId', authenticate, enrollPTSController.getEnrollmentsBySession);
router.get('/stats', authenticate, isAdmin, enrollPTSController.getEnrollmentStats);
router.get('/:id', authenticate, enrollPTSController.getEnrollmentById);
router.patch('/:id', authenticate, enrollPTSController.updateEnrollmentStatus);
router.delete('/:id', authenticate, enrollPTSController.cancelEnrollment);

module.exports = router;
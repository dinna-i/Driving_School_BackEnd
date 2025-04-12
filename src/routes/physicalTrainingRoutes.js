const express = require('express');
const router = express.Router();
const physicalTrainingController = require('../controller/physicalTrainingController');
const { authenticate } = require('../middleware/authMiddleware');
const { isInstructor, isAdmin } = require('../middleware/checkRole');

// Public routes
router.get('/', physicalTrainingController.getAllPhysicalTrainings);
router.get('/available', physicalTrainingController.getAvailableSessions);
router.get('/instructor/:id', physicalTrainingController.getSessionsByInstructor);
router.get('/date-range', physicalTrainingController.getSessionsByDateRange);
router.get('/:id', physicalTrainingController.getPhysicalTrainingById);

// Protected routes - require authentication
router.post('/', authenticate, physicalTrainingController.createPhysicalTraining);
router.put('/:id', authenticate, physicalTrainingController.updatePhysicalTraining);
router.delete('/:id', authenticate, isAdmin, physicalTrainingController.deletePhysicalTraining);
router.patch('/:id/status', authenticate, isInstructor, physicalTrainingController.updateSessionStatus);

module.exports = router;
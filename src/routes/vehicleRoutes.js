const express = require('express');
const router = express.Router();
const vehicleController = require('../controller/vehicleController');
const { authenticate } = require('../middleware/authMiddleware');

// Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// Get available vehicles
router.get('/available', vehicleController.getAvailableVehicles);

// Get vehicles by type
router.get('/filter/type/:type', vehicleController.getVehiclesByType);

// Get vehicle by ID
router.get('/:id', vehicleController.getVehicleById);

// Create a new vehicle (protected route)
router.post('/', authenticate, vehicleController.createVehicle);

// Update a vehicle (protected route)
router.put('/:id', authenticate, vehicleController.updateVehicle);

// Delete a vehicle (protected route)
router.delete('/:id', authenticate, vehicleController.deleteVehicle);

module.exports = router;
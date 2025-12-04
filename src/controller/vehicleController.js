const Vehicle = require('../models/Vehicle');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new vehicle
 * @route POST /api/vehicles
 * @access Private (Admin)
 */
exports.createVehicle = async (req, res) => {
  try {
    const { vehicleNO, vehicleType, transmissionType, fuelType, availability, studentCnt } = req.body;

    // Validate input
    if (!vehicleNO || !vehicleType || !transmissionType || !fuelType || availability === undefined || studentCnt === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if vehicle number already exists
    const existingVehicle = await Vehicle.findOne({ vehicleNO });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this number already exists'
      });
    }

    // Create new vehicle
    const newVehicle = new Vehicle({
      vehicleID: uuidv4(),
      vehicleNO,
      vehicleType,
      transmissionType,
      fuelType,
      availability,
      studentCnt
    });

    await newVehicle.save();

    return res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      vehicle: newVehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create vehicle',
      error: error.message
    });
  }
};

/**
 * Get all vehicles
 * @route GET /api/vehicles
 * @access Public
 */
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    
    return res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve vehicles',
      error: error.message
    });
  }
};

/**
 * Get vehicle by ID
 * @route GET /api/vehicles/:id
 * @access Public
 */
exports.getVehicleById = async (req, res) => {
  try {
    const vehicleID = req.params.id;
    
    const vehicle = await Vehicle.findOne({ vehicleID });
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      vehicle
    });
  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve vehicle',
      error: error.message
    });
  }
};

/**
 * Update vehicle
 * @route PUT /api/vehicles/:id
 * @access Private (Admin)
 */
exports.updateVehicle = async (req, res) => {
  try {
    const vehicleID = req.params.id;
    const { vehicleNO, vehicleType, transmissionType, fuelType, availability, studentCnt } = req.body;
    
    // Validate input
    if (!vehicleNO && !vehicleType && !transmissionType && !fuelType && availability === undefined && studentCnt === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update'
      });
    }
    
    // Check if vehicle exists
    const existingVehicle = await Vehicle.findOne({ vehicleID });
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Check if updated vehicle number already exists (if being updated)
    if (vehicleNO && vehicleNO !== existingVehicle.vehicleNO) {
      const duplicateVehicle = await Vehicle.findOne({ vehicleNO });
      if (duplicateVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle with this number already exists'
        });
      }
    }
    
    // Update vehicle
    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { vehicleID },
      {
        ...(vehicleNO && { vehicleNO }),
        ...(vehicleType && { vehicleType }),
        ...(transmissionType && { transmissionType }),
        ...(fuelType && { fuelType }),
        ...(availability !== undefined && { availability }),
        ...(studentCnt !== undefined && { studentCnt })
      },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update vehicle',
      error: error.message
    });
  }
};

/**
 * Delete vehicle
 * @route DELETE /api/vehicles/:id
 * @access Private (Admin)
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicleID = req.params.id;
    
    // Check if vehicle exists
    const vehicle = await Vehicle.findOne({ vehicleID });
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Delete vehicle
    await Vehicle.findOneAndDelete({ vehicleID });
    
    return res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle',
      error: error.message
    });
  }
};

/**
 * Filter vehicles by type
 * @route GET /api/vehicles/filter/type/:type
 * @access Public
 */
exports.getVehiclesByType = async (req, res) => {
  try {
    const vehicleType = req.params.type;
    
    const vehicles = await Vehicle.find({ vehicleType });
    
    return res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    console.error('Filter vehicles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to filter vehicles',
      error: error.message
    });
  }
};

/**
 * Get available vehicles
 * @route GET /api/vehicles/available
 * @access Public
 */
exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ availability: true });
    
    return res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    console.error('Get available vehicles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve available vehicles',
      error: error.message
    });
  }
};
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vehicleID: {
        type: String,
        required: true,
        unique: true
    },
    vehicleNO: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        required: true
    },
    transmissionType: {
        type: String,
        required: true
    },
    fuelType: {
        type: String,
        required: true
    },
    availability: {
        type: Boolean,
        required: true
    },
    studentCnt: {
        type: Number,
        required: true
    }
    
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
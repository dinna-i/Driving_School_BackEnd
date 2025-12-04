const mongoose = require('mongoose');

const instructorSalarySchema = new mongoose.Schema({
    InstructorID: {
        type: String,
        required: true
    },
    Salary: {
        type: Number,
        required: true,
        default: 2000
    },
    Date: {
        type: Date,
        default: Date.now
    }
});

const InstructorSalary = mongoose.model('InstructorSalary', instructorSalarySchema);

module.exports = InstructorSalary;
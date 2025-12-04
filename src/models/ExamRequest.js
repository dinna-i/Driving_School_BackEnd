const mongoose = require('mongoose');

const ExamRequestSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    regno: {
        type: String,
    },
    message: {
        type: Date,
    }
});

const ExamRequest = mongoose.model('ExamRequest', ExamRequestSchema);

module.exports = ExamRequest; 


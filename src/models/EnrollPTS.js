const mongoose = require('mongoose');

const EnrollPTSSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    sessionID: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "completed" , "absent"]
    },
    date: {
        type: Date,
        required: true ,
        default: Date.now
    }
});

const EnrollPTS = mongoose.model('EnrollPTS', EnrollPTSSchema);

module.exports = EnrollPTS; 


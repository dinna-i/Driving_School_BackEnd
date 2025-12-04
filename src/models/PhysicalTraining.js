const mongoose = require('mongoose');

const PhysicalTrainingSchema = new mongoose.Schema({
    sessionID: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    vehicleID: {
        type: String,
        required: true
    },
    instructorID: {
        type: String,
        required: true
    },
    maxCount: {
        type: Number,
        required: true
    },
    status : {
        type:String ,
        default: "pending" , 
        enum : ["pending" , "completed"]
    },
    // enrolledUsers: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }]
    currentCount: {
        type: Number,
        default: 0,
        required: true
    },
    instructorQualification:{
        type: String 
    }

});

const PhysicalTraining = mongoose.model('PhysicalTraining', PhysicalTrainingSchema);

module.exports = PhysicalTraining;
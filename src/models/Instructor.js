const mongoose = require('mongoose');

const instructorSchema =new mongoose.Schema({
    InstructorID:{
        type: String,
        unique: true,
        require:true
    } ,
    InstructorName:{
        type: String , 
        require:true
    } ,
    email: {
        type:String,
        require:true , 
        unique: true,
    } , 

    InstructorLocation:{
        type:String , 
        require: true
    } ,
    
    InstructorExperience:{
        type:Number, 
        require: true
    } , 
    password:{
        type:String , 
        require: true
    },
    isInstructor: {
        type: Boolean,
        default: true,
    }

},{ timestamps: true });

const Instructor = mongoose.model('Instructor', instructorSchema);

module.exports = Instructor;
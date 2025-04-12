const mongoose = require('mongoose');

const adminSchema =new mongoose.Schema({
    adminID:{
        type: String,
        unique: true,
        require:true
    },
    username:{
        type: String , 
        require:true
    },
    email: {
        type:String,
        require:true , 
        unique: true,
    }, 
    password:{
        type:String , 
        require: true
    },
    isAdmin: {
        type: Boolean,
        default: true,
    }

},{ timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
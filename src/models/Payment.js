const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentID: {
        type: String,
        required: true,
        unique: true
    },
    paymentType: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    studentName: {
        type: String,
        default: true
    },
    remarks: {
        type: String,
    },
    Amount: {
        type: Number,
        required: true
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
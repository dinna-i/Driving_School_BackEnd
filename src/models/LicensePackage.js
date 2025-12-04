const mongoose = require('mongoose');

const LicensePackageSchema = new mongoose.Schema({
  packageName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  }
},{ timestamps: true });

const LicensePackage = mongoose.model('LicensePackage', LicensePackageSchema);

module.exports = LicensePackage;

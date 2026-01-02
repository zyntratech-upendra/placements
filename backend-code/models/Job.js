const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    type: String
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
    required: true
  },
  eligibilityCriteria: {
    departments: [{
      type: String
    }],
    batches: [{
      type: String
    }],
    minCGPA: {
      type: Number
    }
  },
  requiredFields: [{
    fieldName: String,
    fieldType: {
      type: String,
      enum: ['text', 'email', 'number', 'file', 'textarea']
    },
    required: Boolean
  }],
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);

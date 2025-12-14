const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  companyName: {
    type: String,
    required: true
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParsedQuestion'
  }],
  duration: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  scheduledDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPractice: {
    type: Boolean,
    default: false
  },
   assignedStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allowedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  assessmentType: {
    type: String,
    enum: ['scheduled', 'practice', 'random'],
    default: 'practice'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assessment', assessmentSchema);

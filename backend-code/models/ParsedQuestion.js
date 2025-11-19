const mongoose = require('mongoose');

const parsedQuestionSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  topic: {
    type: String
  },
  questionType: {
    type: String,
    enum: ['mcq', 'coding', 'descriptive'],
    default: 'mcq'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ParsedQuestion', parsedQuestionSchema);

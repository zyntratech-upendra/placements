# MongoDB Code Reference

This file contains MongoDB-specific code examples for the Placement Portal.

## Database Connection

```javascript
// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

## MongoDB Queries Examples

### User Operations

```javascript
// Create a user
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword',
  role: 'student',
  rollNumber: '2021CS001',
  department: 'Computer Science',
  batch: '2025'
});

// Find user by email
const user = await User.findOne({ email: 'john@example.com' });

// Find all students
const students = await User.find({ role: 'student' });

// Update user
await User.findByIdAndUpdate(userId, {
  department: 'Information Technology'
});

// Delete user
await User.findByIdAndDelete(userId);
```

### Folder Operations

```javascript
// Create folder
const folder = await Folder.create({
  name: 'Infosys Aptitude',
  companyName: 'Infosys',
  description: 'Aptitude questions for Infosys placement',
  createdBy: adminUserId
});

// Get all folders with creator info
const folders = await Folder.find()
  .populate('createdBy', 'name email')
  .sort('-createdAt');

// Get folder with files
const folder = await Folder.findById(folderId)
  .populate('createdBy', 'name email');
const files = await File.find({ folder: folderId });

// Update folder file count
folder.fileCount += 1;
await folder.save();
```

### File Operations

```javascript
// Create file entry
const file = await File.create({
  filename: 'file-123.pdf',
  originalName: 'questions.pdf',
  filePath: '/uploads/file-123.pdf',
  fileType: 'application/pdf',
  fileSize: 1024000,
  folder: folderId,
  uploadedBy: adminUserId
});

// Get files by folder
const files = await File.find({ folder: folderId })
  .populate('uploadedBy', 'name email')
  .sort('-createdAt');

// Mark file as OCR processed
file.ocrProcessed = true;
file.ocrStatus = 'completed';
await file.save();
```

### Question Operations

```javascript
// Create parsed questions
const questions = await ParsedQuestion.insertMany([
  {
    fileId: fileId,
    folderId: folderId,
    questionText: 'What is 2+2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    difficulty: 'easy',
    questionType: 'mcq'
  },
  // ... more questions
]);

// Get questions by folder
const questions = await ParsedQuestion.find({ folderId: folderId });

// Get random questions
const randomQuestions = await ParsedQuestion.aggregate([
  { $match: { folderId: mongoose.Types.ObjectId(folderId) } },
  { $sample: { size: 10 } }
]);
```

### Assessment Operations

```javascript
// Create assessment
const assessment = await Assessment.create({
  title: 'Infosys Aptitude Test',
  description: 'Practice test for Infosys',
  companyName: 'Infosys',
  folder: folderId,
  questions: [questionId1, questionId2, questionId3],
  duration: 30,
  totalMarks: 30,
  isPractice: true,
  assessmentType: 'practice',
  createdBy: adminUserId
});

// Get assessment with full details
const assessment = await Assessment.findById(assessmentId)
  .populate('folder', 'name companyName')
  .populate('questions')
  .populate('createdBy', 'name email');

// Get student's available assessments
const assessments = await Assessment.find({
  $or: [
    { isPractice: true },
    { allowedStudents: studentId },
    { assessmentType: 'random' }
  ]
}).populate('folder', 'name companyName');
```

### Attempt Operations

```javascript
// Start attempt
const attempt = await Attempt.create({
  assessment: assessmentId,
  student: studentId,
  startTime: Date.now(),
  status: 'in_progress'
});

// Save answer
const answerIndex = attempt.answers.findIndex(
  a => a.questionId.toString() === questionId
);

if (answerIndex > -1) {
  attempt.answers[answerIndex] = {
    questionId,
    selectedAnswer: answer,
    isCorrect: true,
    marksObtained: 1
  };
} else {
  attempt.answers.push({
    questionId,
    selectedAnswer: answer,
    isCorrect: true,
    marksObtained: 1
  });
}
await attempt.save();

// Submit attempt
attempt.endTime = Date.now();
attempt.totalScore = attempt.answers.reduce((sum, ans) => sum + ans.marksObtained, 0);
attempt.percentage = (attempt.totalScore / assessment.totalMarks) * 100;
attempt.status = 'submitted';
attempt.timeTaken = Math.floor((attempt.endTime - attempt.startTime) / 1000);
await attempt.save();

// Get student's attempts
const attempts = await Attempt.find({ student: studentId })
  .populate('assessment', 'title companyName duration totalMarks')
  .sort('-createdAt');

// Get attempts by assessment
const attempts = await Attempt.find({ assessment: assessmentId })
  .populate('student', 'name email rollNumber department')
  .sort('-createdAt');
```

## MongoDB Aggregation Examples

### Get Student Performance Statistics

```javascript
const stats = await Attempt.aggregate([
  { $match: { student: mongoose.Types.ObjectId(studentId), status: 'submitted' } },
  {
    $group: {
      _id: null,
      avgPercentage: { $avg: '$percentage' },
      totalAttempts: { $sum: 1 },
      maxScore: { $max: '$percentage' },
      minScore: { $min: '$percentage' }
    }
  }
]);
```

### Get Company-wise Performance

```javascript
const companyStats = await Attempt.aggregate([
  { $match: { student: mongoose.Types.ObjectId(studentId) } },
  {
    $lookup: {
      from: 'assessments',
      localField: 'assessment',
      foreignField: '_id',
      as: 'assessmentInfo'
    }
  },
  { $unwind: '$assessmentInfo' },
  {
    $group: {
      _id: '$assessmentInfo.companyName',
      avgScore: { $avg: '$percentage' },
      attempts: { $sum: 1 }
    }
  },
  { $sort: { avgScore: -1 } }
]);
```

### Get Top Performers

```javascript
const topPerformers = await Attempt.aggregate([
  { $match: { status: 'submitted' } },
  {
    $group: {
      _id: '$student',
      avgPercentage: { $avg: '$percentage' },
      totalAttempts: { $sum: 1 }
    }
  },
  { $sort: { avgPercentage: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'studentInfo'
    }
  },
  { $unwind: '$studentInfo' }
]);
```

## Mongoose Middleware

### Pre-save Hook for Password Hashing

```javascript
// In User model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

### Instance Method for Password Comparison

```javascript
// In User model
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

## MongoDB Indexes (for Performance)

```javascript
// In your models, add indexes for frequently queried fields

// User model
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Folder model
folderSchema.index({ companyName: 1 });
folderSchema.index({ createdBy: 1 });

// ParsedQuestion model
parsedQuestionSchema.index({ folderId: 1 });
parsedQuestionSchema.index({ fileId: 1 });

// Assessment model
assessmentSchema.index({ companyName: 1 });
assessmentSchema.index({ assessmentType: 1 });
assessmentSchema.index({ createdBy: 1 });

// Attempt model
attemptSchema.index({ student: 1 });
attemptSchema.index({ assessment: 1 });
attemptSchema.index({ status: 1 });
```

## MongoDB Best Practices

1. **Always use async/await with try-catch**
```javascript
try {
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Process user
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
}
```

2. **Use lean() for read-only operations (faster)**
```javascript
const users = await User.find().lean(); // Returns plain JS objects
```

3. **Use select() to limit returned fields**
```javascript
const users = await User.find().select('name email role');
```

4. **Use populate() carefully (can be slow)**
```javascript
// Good
const assessments = await Assessment.find()
  .populate('folder', 'name companyName');

// Avoid over-populating
// Bad: .populate('everything')
```

5. **Use transactions for related updates**
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  await User.create([{ name: 'Test' }], { session });
  await Folder.create([{ name: 'Test Folder' }], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## MongoDB Shell Commands

```bash
# Connect to MongoDB
mongo

# Show databases
show dbs

# Use database
use placement_portal

# Show collections
show collections

# Find all users
db.users.find()

# Find specific user
db.users.findOne({ email: "pranav2005@gmail.com" })

# Count documents
db.users.countDocuments()

# Drop collection
db.attempts.drop()

# Create index
db.users.createIndex({ email: 1 }, { unique: true })

# Show indexes
db.users.getIndexes()
```

---

This reference covers all MongoDB operations used in the Placement Portal application.

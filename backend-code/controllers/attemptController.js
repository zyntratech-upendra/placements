const Attempt = require('../models/Attempt');
const Assessment = require('../models/Assessment');
const ParsedQuestion = require('../models/ParsedQuestion');

exports.startAttempt = async (req, res) => {
  try {
    const { assessmentId } = req.body;

    const assessment = await Assessment.findById(assessmentId).populate('questions');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (!assessment.questions || assessment.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assessment has no questions'
      });
    }

    const existingAttempt = await Attempt.findOne({
      assessment: assessmentId,
      student: req.user._id,
      status: 'in_progress'
    }).populate('assessment');

    if (existingAttempt) {
      if (!existingAttempt.assessment.questions) {
        existingAttempt.assessment = await Assessment.findById(assessmentId).populate('questions');
      }
      return res.status(200).json({
        success: true,
        message: 'Resume existing attempt',
        attempt: existingAttempt,
        assessment
      });
    }

    const attempt = await Attempt.create({
      assessment: assessmentId,
      student: req.user._id,
      startTime: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Attempt started successfully',
      attempt,
      assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, selectedAnswer } = req.body;

    const attempt = await Attempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    if (attempt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const question = await ParsedQuestion.findById(questionId);
    console.log(question.correctAnswer);
    console.log(selectedAnswer);
    const isCorrect = question.correctAnswer === selectedAnswer;
    const marksObtained = isCorrect ? 1 : 0;

    const answerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (answerIndex > -1) {
      attempt.answers[answerIndex] = {
        questionId,
        selectedAnswer,
        isCorrect,
        marksObtained
      };
    } else {
      attempt.answers.push({
        questionId,
        selectedAnswer,
        isCorrect,
        marksObtained
      });
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      attempt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.body;

    const attempt = await Attempt.findById(attemptId).populate('assessment');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    if (attempt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const totalScore = attempt.answers.reduce((sum, ans) => sum + ans.marksObtained, 0);
    const percentage = (totalScore / attempt.assessment.totalMarks) * 100;

    attempt.endTime = Date.now();
    attempt.totalScore = totalScore;
    attempt.percentage = percentage.toFixed(2);
    attempt.status = 'submitted';
    attempt.timeTaken = Math.floor((attempt.endTime - attempt.startTime) / 1000);

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Attempt submitted successfully',
      attempt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('assessment')
      .populate('student', 'name email rollNumber')
      .populate('answers.questionId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      attempt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ student: req.user._id })
      .populate('assessment', 'title companyName duration totalMarks')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAllAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find()
      .populate('student', 'name email rollNumber department')
      .populate('assessment', 'title companyName duration totalMarks')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAttemptsByAssessment = async (req, res) => {
  try {
    const attempts = await Attempt.find({ assessment: req.params.assessmentId })
      .populate('student', 'name email rollNumber department')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

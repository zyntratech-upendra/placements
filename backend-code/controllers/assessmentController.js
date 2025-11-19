const Assessment = require('../models/Assessment');
const ParsedQuestion = require('../models/ParsedQuestion');
const Attempt = require('../models/Attempt');

exports.createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      companyName,
      folder,
      duration,
      totalMarks,
      scheduledDate,
      endDate,
      isPractice,
      assessmentType,
      allowedStudents,
      questionIds
    } = req.body;

    const assessment = await Assessment.create({
      title,
      description,
      companyName,
      folder,
      questions: questionIds || [],
      duration,
      totalMarks,
      scheduledDate,
      endDate,
      isPractice,
      assessmentType,
      allowedStudents,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
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

exports.getAllAssessments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query = {
        $or: [
          { isPractice: true },
          { allowedStudents: req.user._id },
          { assessmentType: 'random' }
        ]
      };
    }

    const assessments = await Assessment.find(query)
      .populate('folder', 'name companyName')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('folder', 'name companyName')
      .populate('questions')
      .populate('createdBy', 'name email');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
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

exports.getQuestionsByFolder = async (req, res) => {
  try {
    const questions = await ParsedQuestion.find({ folderId: req.params.folderId });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateAssessment = async (req, res) => {
  try {
    let assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
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

exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    await Assessment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.generateRandomAssessment = async (req, res) => {
  try {
    const { folderId, numberOfQuestions, duration } = req.body;

    const allQuestions = await ParsedQuestion.find({ folderId });

    if (allQuestions.length < numberOfQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Not enough questions available'
      });
    }

    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, numberOfQuestions);

    const assessment = await Assessment.create({
      title: `Random Practice Assessment - ${Date.now()}`,
      description: 'Auto-generated random practice assessment',
      companyName: 'Practice',
      folder: folderId,
      questions: selectedQuestions.map(q => q._id),
      duration: duration || 30,
      totalMarks: numberOfQuestions * 1,
      isPractice: true,
      assessmentType: 'random',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Random assessment generated successfully',
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

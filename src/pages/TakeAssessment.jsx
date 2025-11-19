import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';

const TakeAssessment = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAssessment();
  }, [assessmentId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && attempt && assessment) {
      handleSubmit();
    }
  }, [timeLeft]);

  const initializeAssessment = async () => {
    try {
      const { data: assessmentData } = await api.get(`/assessments/${assessmentId}`);
      setAssessment(assessmentData.assessment);
      setTimeLeft(assessmentData.assessment.duration * 60);

      const { data: attemptData } = await api.post('/attempts/start', { assessmentId });
      setAttempt(attemptData.attempt);

      setLoading(false);
    } catch (error) {
      console.error('Error initializing assessment:', error);
      alert('Error loading assessment');
      navigate('/student');
    }
  };

  const handleAnswerSelect = async (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });

    try {
      await api.post('/attempts/answer', {
        attemptId: attempt._id,
        questionId,
        selectedAnswer: answer
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/attempts/submit', { attemptId: attempt._id });
      alert('Assessment submitted successfully!');
      navigate('/student');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const question = assessment.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{assessment.title}</h1>
              <p className="text-sm text-gray-600">{assessment.companyName}</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Time Left</p>
                <p className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentQuestion + 1}/{assessment.questions.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-6">
          <div className="mb-4">
            <span className="text-sm text-gray-600">Question {currentQuestion + 1}</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.questionText}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(question._id, option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  answers[question._id] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[question._id] === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[question._id] === option && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex space-x-2">
            {assessment.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[assessment.questions[index]._id]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion < assessment.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="btn btn-primary"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn bg-green-600 hover:bg-green-700 text-white"
            >
              Submit Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeAssessment;

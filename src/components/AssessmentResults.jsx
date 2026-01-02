import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';

const AssessmentResults = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    fetchAttemptDetails();
  }, [attemptId]);

  const fetchAttemptDetails = async () => {
    try {
      const { data } = await api.get(`/attempts/${attemptId}`);
      setAttempt(data.attempt);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attempt:', error);
      alert('Error loading results');
      navigate('/student');
    }
  };

  if (loading || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const assessment = attempt.assessment;
  const totalQuestions = attempt.answers?.length || 0;
  const correctAnswers = attempt.answers?.filter(ans => ans.isCorrect).length || 0;
  const wrongAnswers = totalQuestions - correctAnswers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{assessment.title}</h1>
          <p className="text-gray-600 mb-6">{assessment.companyName}</p>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <p className="text-gray-600 text-sm mb-2">Total Score</p>
              <p className="text-3xl font-bold text-blue-600">{attempt.totalScore}/{assessment.totalMarks}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
              <p className="text-gray-600 text-sm mb-2">Percentage</p>
              <p className="text-3xl font-bold text-green-600">{attempt.percentage}%</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6">
              <p className="text-gray-600 text-sm mb-2">Correct</p>
              <p className="text-3xl font-bold text-emerald-600">{correctAnswers}</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
              <p className="text-gray-600 text-sm mb-2">Wrong</p>
              <p className="text-3xl font-bold text-red-600">{wrongAnswers}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center border-t pt-6">
            <div>
              <p className="text-gray-600 text-sm">Duration</p>
              <p className="text-lg font-semibold text-gray-900">{assessment.duration} minutes</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Time Taken</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Submitted On</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(attempt.endTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-100 px-8 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Answer Review</h2>
          </div>

          <div className="divide-y">
            {attempt.answers?.map((answer, index) => (
              <div key={index} className="border-b last:border-b-0">
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                  className="w-full px-8 py-6 text-left hover:bg-gray-50 transition-colors focus:outline-none"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-semibold text-sm">
                          {index + 1}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          answer.isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {answer.isCorrect ? '✓ Correct' : '✗ Wrong'}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">{answer.questionId.questionText}</p>
                    </div>
                    <div className="ml-4">
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedQuestion === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                </button>

                {expandedQuestion === index && (
                  <div className="px-8 py-6 bg-gray-50 border-t">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-3">Options:</p>
                        <div className="space-y-2">
                          {answer.questionId.options?.map((option, optIndex) => {
                            const isSelected = answer.selectedAnswer === option;
                            const isCorrect = answer.questionId.correctAnswer === option;
                            const isWrongSelection = isSelected && !isCorrect;

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrect
                                    ? 'border-green-500 bg-green-50'
                                    : isWrongSelection
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                    isCorrect
                                      ? 'border-green-500 bg-green-500'
                                      : isWrongSelection
                                      ? 'border-red-500 bg-red-500'
                                      : isSelected
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {isCorrect && <span className="text-white text-xs">✓</span>}
                                    {isWrongSelection && <span className="text-white text-xs">✗</span>}
                                  </div>
                                  <span className={`font-medium ${
                                    isCorrect
                                      ? 'text-green-900'
                                      : isWrongSelection
                                      ? 'text-red-900'
                                      : 'text-gray-900'
                                  }`}>
                                    {option}
                                  </span>
                                  {isCorrect && <span className="ml-auto text-xs font-semibold text-green-600">CORRECT</span>}
                                  {isWrongSelection && <span className="ml-auto text-xs font-semibold text-red-600">YOUR ANSWER</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {!answer.isCorrect && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            <span className="font-semibold">Correct Answer:</span> {answer.questionId.correctAnswer}
                          </p>
                        </div>
                      )}

                      {answer.questionId.topic && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">Topic:</span> {answer.questionId.topic}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/student')}
            className="btn btn-primary px-8"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../config/api';

const StudentDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    avgScore: 0,
    completedAssessments: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assessmentsRes, attemptsRes, foldersRes] = await Promise.all([
        api.get('/assessments'),
        api.get('/attempts/my-attempts'),
        api.get('/folders')
      ]);

      setAssessments(assessmentsRes.data.assessments || []);
      setAttempts(attemptsRes.data.attempts || []);
      setFolders(foldersRes.data.folders || []);

      const myAttempts = attemptsRes.data.attempts || [];
      const completed = myAttempts.filter(a => a.status === 'submitted');
      const avgScore = completed.length > 0
        ? completed.reduce((sum, a) => sum + parseFloat(a.percentage), 0) / completed.length
        : 0;

      setStats({
        totalAttempts: myAttempts.length,
        avgScore: avgScore.toFixed(1),
        completedAssessments: completed.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const startAssessment = (assessmentId) => {
    navigate(`/student/assessment/${assessmentId}`);
  };

  const startRandomPractice = async (folderId) => {
    try {
      const { data } = await api.post('/assessments/random', {
        folderId,
        numberOfQuestions: 10,
        duration: 30
      });
      navigate(`/student/assessment/${data.assessment._id}`);
    } catch (error) {
      console.error('Error creating random assessment:', error);
      alert('Not enough questions available for this company');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Practice and take assessments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Attempts</p>
                <p className="text-3xl font-bold mt-1">{stats.totalAttempts}</p>
              </div>
              <div className="text-4xl opacity-50">📝</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Average Score</p>
                <p className="text-3xl font-bold mt-1">{stats.avgScore}%</p>
              </div>
              <div className="text-4xl opacity-50">🎯</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Completed</p>
                <p className="text-3xl font-bold mt-1">{stats.completedAssessments}</p>
              </div>
              <div className="text-4xl opacity-50">✅</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice by Company</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div
                key={folder._id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => startRandomPractice(folder._id)}
              >
                <div className="text-3xl mb-2">🏢</div>
                <h3 className="font-semibold text-lg text-gray-900">{folder.companyName}</h3>
                <p className="text-sm text-gray-600 mt-1">{folder.fileCount} questions available</p>
                <button className="mt-3 w-full btn btn-primary text-sm">
                  Start Practice
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Assessments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((assessment) => (
              <div key={assessment._id} className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-500 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">{assessment.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    assessment.assessmentType === 'practice'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {assessment.assessmentType}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{assessment.companyName}</p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{assessment.duration} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Marks:</span>
                    <span className="font-medium">{assessment.totalMarks}</span>
                  </div>
                </div>
                <button
                  onClick={() => startAssessment(assessment._id)}
                  className="w-full btn btn-primary"
                >
                  Start Assessment
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Attempts</h2>
          <div className="space-y-3">
            {attempts.length > 0 ? (
              attempts.map((attempt) => (
                <div key={attempt._id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{attempt.assessment?.title}</h3>
                    <p className="text-sm text-gray-600">{attempt.assessment?.companyName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{attempt.percentage}%</p>
                      <p className="text-sm text-gray-600">
                        {attempt.totalScore}/{attempt.assessment?.totalMarks}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getStatusColor(attempt.status)}`}>
                        {attempt.status}
                      </span>
                    </div>
                    {attempt.status === 'submitted' && (
                      <button
                        onClick={() => navigate(`/assessment-results/${attempt._id}`)}
                        className="btn btn-primary text-sm whitespace-nowrap"
                      >
                        View Results
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No attempts yet. Start practicing!</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;

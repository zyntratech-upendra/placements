import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../config/api';
import aiApi from '../config/aiapi';
const StudentDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [folders, setFolders] = useState([]);

  // 🔹 AI Interviews
  const [interviews, setInterviews] = useState([]);

  const [stats, setStats] = useState({
    totalAttempts: 0,
    avgScore: 0,
    completedAssessments: 0
  });

  const [interviewStats, setInterviewStats] = useState({
    total: 0,
    completed: 0,
    avgScore: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        assessmentsRes,
        attemptsRes,
        foldersRes,
        interviewsRes
      ] = await Promise.all([
        api.get('/assessments'),
        api.get('/attempts/my-attempts'),
        api.get('/folders'),
        aiApi.get('/my-sessions')
      ]);

      // ---------- Existing Data ----------
      setAssessments(assessmentsRes.data.assessments || []);
      setAttempts(attemptsRes.data.attempts || []);
      setFolders(foldersRes.data.folders || []);

      const myAttempts = attemptsRes.data.attempts || [];
      const completed = myAttempts.filter(a => a.status === 'submitted');
      const avgScore =
        completed.length > 0
          ? completed.reduce((sum, a) => sum + parseFloat(a.percentage), 0) /
            completed.length
          : 0;

      setStats({
        totalAttempts: myAttempts.length,
        avgScore: avgScore.toFixed(1),
        completedAssessments: completed.length
      });

      // ---------- AI Interview Data ----------
      const myInterviews = interviewsRes.data.sessions || [];
      setInterviews(myInterviews);

      const completedInterviews = myInterviews.filter(
        i => i.status === 'completed'
      );

      const avgInterviewScore =
        completedInterviews.length > 0
          ? completedInterviews.reduce(
              (s, i) => s + (i.final_score || 0),
              0
            ) / completedInterviews.length
          : 0;

      setInterviewStats({
        total: myInterviews.length,
        completed: completedInterviews.length,
        avgScore: avgInterviewScore.toFixed(1)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      alert('Not enough questions available for this company');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
      case 'created':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout>
      <div>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Practice assessments and AI interviews
          </p>
        </div>

        {/* Assessment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-blue-100 text-sm">Total Attempts</p>
            <p className="text-3xl font-bold mt-1">{stats.totalAttempts}</p>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-green-100 text-sm">Average Score</p>
            <p className="text-3xl font-bold mt-1">{stats.avgScore}%</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <p className="text-purple-100 text-sm">Completed</p>
            <p className="text-3xl font-bold mt-1">
              {stats.completedAssessments}
            </p>
          </div>
        </div>

        {/* AI Interview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <p className="text-indigo-100 text-sm">AI Interviews</p>
            <p className="text-3xl font-bold mt-1">{interviewStats.total}</p>
          </div>

          <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <p className="text-emerald-100 text-sm">Completed Interviews</p>
            <p className="text-3xl font-bold mt-1">
              {interviewStats.completed}
            </p>
          </div>

          <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <p className="text-pink-100 text-sm">Avg Interview Score</p>
            <p className="text-3xl font-bold mt-1">
              {interviewStats.avgScore}/10
            </p>
          </div>
        </div>

        {/* Practice by Company */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Practice by Company
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map(folder => (
              <div
                key={folder._id}
                className="bg-gray-50 p-4 rounded-lg hover:shadow-md cursor-pointer"
                onClick={() => startRandomPractice(folder._id)}
              >
                <h3 className="font-semibold text-lg">
                  {folder.companyName}
                </h3>
                <p className="text-sm text-gray-600">
                  {folder.fileCount} questions available
                </p>
                <button className="mt-3 w-full btn btn-primary text-sm">
                  Start Practice
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* AVAILABLE ASSESSMENTS */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Available Assessments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map(assessment => (
              <div
                key={assessment._id}
                className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-500 transition-all"
              >
                <h3 className="font-semibold text-lg">{assessment.title}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {assessment.companyName}
                </p>
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

        {/* MY ATTEMPTS */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">My Attempts</h2>

          {attempts.length ? (
            attempts.map(attempt => (
              <div
                key={attempt._id}
                className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mb-3"
              >
                <div>
                  <h3 className="font-semibold">{attempt.assessment?.title}</h3>
                  <p className="text-sm text-gray-600">
                    {attempt.assessment?.companyName}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">{attempt.percentage}%</p>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(attempt.status)}`}>
                    {attempt.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">
              No attempts yet
            </p>
          )}
        </div>

      </div>

        {/* AI Interview History */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            AI Interview History
          </h2>

          {interviews.length > 0 ? (
            <div className="space-y-4">
              {interviews.map(interview => (
                <div
                  key={interview.id}
                  className="bg-gray-50 p-4 rounded-lg flex justify-between"
                >
                  <div>
                    <h3 className="font-semibold">
                      {interview.interview_type.toUpperCase()} Interview
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {interview.job_description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(interview.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-bold">
                        {interview.final_score ?? '—'}
                      </p>
                      <p className="text-sm">/10</p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getStatusColor(
                          interview.status
                        )}`}
                      >
                        {interview.status}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/student/interview-results/${interview.id}`
                        )
                      }
                      className="btn btn-primary text-sm"
                    >
                      View Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-6">
              No AI interviews yet
            </p>
          )}
        </div>
        
      </div>
      
    </Layout>
  );
};

export default StudentDashboard;

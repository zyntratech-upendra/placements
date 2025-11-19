import { useState, useEffect } from 'react';
import api from '../../config/api';

const AssessmentManagement = () => {
  const [assessments, setAssessments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    companyName: '',
    folder: '',
    duration: 30,
    totalMarks: 10,
    assessmentType: 'practice'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssessments();
    fetchFolders();
  }, []);

  const fetchAssessments = async () => {
    try {
      const { data } = await api.get('/assessments');
      setAssessments(data.assessments || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const { data } = await api.get('/folders');
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/assessments', {
        ...newAssessment,
        isPractice: newAssessment.assessmentType === 'practice'
      });
      setShowCreateModal(false);
      setNewAssessment({
        title: '',
        description: '',
        companyName: '',
        folder: '',
        duration: 30,
        totalMarks: 10,
        assessmentType: 'practice'
      });
      fetchAssessments();
      alert('Assessment created successfully!');
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Error creating assessment');
    }
    setLoading(false);
  };

  const viewAttempts = async (assessment) => {
    setSelectedAssessment(assessment);
    try {
      const { data } = await api.get(`/attempts/assessment/${assessment._id}`);
      setAttempts(data.attempts || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'practice':
        return 'bg-green-100 text-green-700';
      case 'random':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Assessment Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Create Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment) => (
          <div key={assessment._id} className="card">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg text-gray-900">{assessment.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadgeColor(assessment.assessmentType)}`}>
                {assessment.assessmentType}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{assessment.companyName}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{assessment.duration} mins</span>
              </div>
              <div className="flex justify-between">
                <span>Total Marks:</span>
                <span className="font-medium">{assessment.totalMarks}</span>
              </div>
              <div className="flex justify-between">
                <span>Questions:</span>
                <span className="font-medium">{assessment.questions?.length || 0}</span>
              </div>
            </div>
            <button
              onClick={() => viewAttempts(assessment)}
              className="mt-4 w-full btn btn-secondary text-sm"
            >
              View Attempts
            </button>
          </div>
        ))}
      </div>

      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Attempts for {selectedAssessment.title}</h3>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {attempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Percentage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time Taken
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attempts.map((attempt) => (
                      <tr key={attempt._id}>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium">{attempt.student?.name}</p>
                            <p className="text-gray-500 text-xs">{attempt.student?.rollNumber}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {attempt.totalScore}/{selectedAssessment.totalMarks}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {attempt.percentage}%
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            attempt.status === 'submitted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {attempt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {attempt.timeTaken ? `${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No attempts yet</p>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create Assessment</h3>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={newAssessment.title}
                  onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Company Name</label>
                <input
                  type="text"
                  value={newAssessment.companyName}
                  onChange={(e) => setNewAssessment({ ...newAssessment, companyName: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Select Folder</label>
                <select
                  value={newAssessment.folder}
                  onChange={(e) => setNewAssessment({ ...newAssessment, folder: e.target.value })}
                  className="input"
                >
                  <option value="">Select a folder</option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name} - {folder.companyName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Duration (minutes)</label>
                <input
                  type="number"
                  value={newAssessment.duration}
                  onChange={(e) => setNewAssessment({ ...newAssessment, duration: parseInt(e.target.value) })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Total Marks</label>
                <input
                  type="number"
                  value={newAssessment.totalMarks}
                  onChange={(e) => setNewAssessment({ ...newAssessment, totalMarks: parseInt(e.target.value) })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Assessment Type</label>
                <select
                  value={newAssessment.assessmentType}
                  onChange={(e) => setNewAssessment({ ...newAssessment, assessmentType: e.target.value })}
                  className="input"
                >
                  <option value="practice">Practice</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="random">Random</option>
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentManagement;

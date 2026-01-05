import { useState, useEffect } from 'react';

const INTERVIEW_API_URL = 'http://localhost:8000/api';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyQuestions, setCompanyQuestions] = useState([]);
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: ''
  });
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    interview_type: 'technical',
    difficulty: 'medium'
  });
  const [bulkQuestions, setBulkQuestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${INTERVIEW_API_URL}/companies`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', newCompany.name);
      if (newCompany.description) {
        formData.append('description', newCompany.description);
      }

      const response = await fetch(`${INTERVIEW_API_URL}/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create company');
      }

      setShowCreateModal(false);
      setNewCompany({ name: '', description: '' });
      fetchCompanies();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('question_text', newQuestion.question_text);
      formData.append('interview_type', newQuestion.interview_type);
      formData.append('difficulty', newQuestion.difficulty);

      const response = await fetch(
        `${INTERVIEW_API_URL}/companies/${selectedCompany.id}/questions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to add question');
      }

      setNewQuestion({ question_text: '', interview_type: 'technical', difficulty: 'medium' });
      fetchCompanyQuestions(selectedCompany.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAddQuestions = async (e) => {
    e.preventDefault();
    if (!selectedCompany || !bulkQuestions.trim()) return;

    setLoading(true);
    setError('');

    try {
      const questionsList = bulkQuestions
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      if (questionsList.length === 0) {
        throw new Error('Please enter at least one question');
      }

      const formData = new FormData();
      formData.append('questions', JSON.stringify(questionsList));
      formData.append('interview_type', newQuestion.interview_type);

      const response = await fetch(
        `${INTERVIEW_API_URL}/companies/${selectedCompany.id}/questions/bulk`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to add questions');
      }

      setBulkQuestions('');
      fetchCompanyQuestions(selectedCompany.id);
      setShowQuestionModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyQuestions = async (companyId) => {
    try {
      const response = await fetch(`${INTERVIEW_API_URL}/companies/${companyId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanyQuestions(data.company.questions || []);
      }
    } catch (error) {
      console.error('Error fetching company questions:', error);
    }
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    fetchCompanyQuestions(company.id);
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company and all its questions?')) {
      return;
    }

    try {
      const response = await fetch(`${INTERVIEW_API_URL}/companies/${companyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        fetchCompanies();
        if (selectedCompany?.id === companyId) {
          setSelectedCompany(null);
          setCompanyQuestions([]);
        }
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const response = await fetch(
        `${INTERVIEW_API_URL}/companies/${selectedCompany.id}/questions/${questionId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        fetchCompanyQuestions(selectedCompany.id);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Interview Companies</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Create Company
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <div
            key={company.id}
            onClick={() => handleCompanyClick(company)}
            className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
              selectedCompany?.id === company.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCompany(company.id);
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                🗑️
              </button>
            </div>
            {company.description && (
              <p className="text-sm text-gray-600 mb-2">{company.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {company.question_count || 0} Questions
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedCompany && (
        <div className="mt-6 card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Questions for {selectedCompany.name}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowQuestionModal(true);
                  setBulkQuestions('');
                }}
                className="btn btn-primary"
              >
                + Add Question
              </button>
              <button
                onClick={() => {
                  setShowQuestionModal(true);
                  setBulkQuestions('');
                }}
                className="btn bg-purple-600 hover:bg-purple-700 text-white"
              >
                + Bulk Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {companyQuestions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No questions added yet.</p>
            ) : (
              companyQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2">{question.question_text}</p>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        question.interview_type === 'technical'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {question.interview_type}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create New Company</h3>
            <form onSubmit={handleCreateCompany}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setNewCompany({ name: '', description: '' });
                  }}
                  className="flex-1 btn bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn btn-primary"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showQuestionModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Add Questions to {selectedCompany.name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Type
              </label>
              <select
                value={newQuestion.interview_type}
                onChange={(e) => setNewQuestion({ ...newQuestion, interview_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Questions (one per line for bulk, or single question)
              </label>
              <textarea
                value={bulkQuestions || newQuestion.question_text}
                onChange={(e) => {
                  if (bulkQuestions) {
                    setBulkQuestions(e.target.value);
                  } else {
                    setNewQuestion({ ...newQuestion, question_text: e.target.value });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="8"
                placeholder="Enter questions here, one per line for bulk add..."
              />
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowQuestionModal(false);
                  setError('');
                  setNewQuestion({ question_text: '', interview_type: 'technical', difficulty: 'medium' });
                  setBulkQuestions('');
                }}
                className="flex-1 btn bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={bulkQuestions ? handleBulkAddQuestions : handleAddQuestion}
                disabled={loading}
                className="flex-1 btn btn-primary"
              >
                {loading ? 'Adding...' : bulkQuestions ? 'Add All Questions' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;


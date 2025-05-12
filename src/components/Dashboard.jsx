import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';
import Alert from './Alert';
import { projectService } from '../utils/api';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectService.getAllProjects();
      setProjects(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch projects. Please try again.');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject) => {
    setProjects([...projects, newProject]);
    setShowProjectForm(false);
  };

  const handleProjectDeleted = (projectId) => {
    setProjects(projects.filter((project) => project.id !== projectId));
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <button
            onClick={() => setShowProjectForm(!showProjectForm)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showProjectForm ? 'Cancel' : 'New Project'}
          </button>
        </div>

        {error && <Alert message={error} onClose={() => setError('')} />}

        {showProjectForm && (
          <div className="mb-6">
            <ProjectForm
              onProjectCreated={handleProjectCreated}
              onCancel={() => setShowProjectForm(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading projects...</span>
          </div>
        ) : (
          <ProjectList
            projects={projects}
            onDelete={handleProjectDeleted}
            onView={handleViewProject}
          />
        )}

        {!loading && projects.length === 0 && !showProjectForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No projects yet</p>
            <button
              onClick={() => setShowProjectForm(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create your first project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
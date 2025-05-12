import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import Alert from './Alert';
import { projectService, taskService } from '../utils/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProject = async () => {
    try {
      const response = await projectService.getProject(id);
      setProject(response.data);
      setTasks(response.data.tasks || []);
      setError('');
    } catch (error) {
      setError('Failed to fetch project details. Please try again.');
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await taskService.getProjectTasks(id, statusFilter);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project) {
      fetchTasks();
    }
  }, [statusFilter, project]);

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(id);
        navigate('/dashboard');
      } catch (error) {
        setError('Failed to delete project. Please try again.');
        console.error('Error deleting project:', error);
      }
    }
  };

  if (loading) {
    return (
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
        <span>Loading project details...</span>
      </div>
    );
  }

  if (!project && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Project not found</div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {error && <Alert message={error} onClose={() => setError('')} />}

        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-4 inline-flex items-center text-indigo-600 hover:text-indigo-900"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showTaskForm ? 'Cancel' : 'Add Task'}
            </button>
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Project
            </button>
          </div>
        </div>

        {showTaskForm && (
          <div className="mb-6">
            <TaskForm
              projectId={id}
              onTaskCreated={handleTaskCreated}
              onCancel={() => setShowTaskForm(false)}
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <TaskList
          tasks={tasks}
          onDelete={handleTaskDeleted}
          onTaskUpdated={fetchTasks}
        />

        {tasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tasks in this project yet</p>
            {!showTaskForm && (
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add your first task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
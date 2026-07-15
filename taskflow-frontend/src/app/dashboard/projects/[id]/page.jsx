"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";

const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_COLORS = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
};

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    due_date: "",
  });

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}/`);
      setProject(data);
    } catch (err) {
      setError("Project not found.");
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/projects/${id}/tasks/`);
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.due_date) delete payload.due_date;

      const { data } = await api.post(`/projects/${id}/tasks/`, payload);
      setTasks([...tasks, data]);
      setFormData({ title: "", description: "", status: "todo", due_date: "" });
      setShowForm(false);
    } catch (err) {
      setError("Failed to create task.");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await api.patch(`/projects/${id}/tasks/${taskId}/`, {
        status: newStatus,
      });
      setTasks(tasks.map(t => t.id === taskId ? data : t));
    } catch (err) {
      setError("Failed to update task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}/`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError("Failed to delete task.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-blue-600 text-sm hover:underline">
            ← Back to projects
          </Link>
          <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Project header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{project?.name}</h2>
          {project?.description && (
            <p className="text-gray-500 text-sm mt-1">{project.description}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Add task button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">
            Tasks ({tasks.length})
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            {showForm ? "Cancel" : "+ Add Task"}
          </button>
        </div>

        {/* Create task form */}
        {showForm && (
          <form
            onSubmit={handleCreateTask}
            className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4"
          >
            <h3 className="font-semibold text-gray-700">New task</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Design homepage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional details"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Create task
            </button>
          </form>
        )}

        {/* Tasks list */}
        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">No tasks yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-sm p-5 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                  )}
                  {task.due_date && (
                    <p className="text-xs text-gray-400">Due: {task.due_date}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects/");
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/projects/", formData);
      setProjects([data, ...projects]);
      setFormData({ name: "", description: "" });
      setShowForm(false);
    } catch (err) {
      setError("Failed to create project.");
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}/`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      setError("Failed to delete project.");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
            <p className="text-gray-500 text-sm mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Create project form */}
        {showForm && (
          <form
            onSubmit={handleCreateProject}
            className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4"
          >
            <h3 className="font-semibold text-gray-700">New project</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Portfolio website"
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
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What is this project about?"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Create project
            </button>
          </form>
        )}

        {/* Projects grid */}
        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">No projects yet. Create one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {project.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {project.description || "No description."}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {project.tasks?.length || 0} task{project.tasks?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="flex-1 text-center bg-blue-50 text-blue-600 text-sm py-1.5 rounded-lg hover:bg-blue-100 transition"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-sm text-red-400 hover:text-red-600 transition px-2"
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
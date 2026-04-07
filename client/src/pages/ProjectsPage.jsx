import { useState, useEffect } from 'react';
import { projectsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, MoreVertical, Calendar, Users as UsersIcon, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    deadline: '',
    members: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        projectsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        status: project.status,
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
        members: project.members.map(m => m._id || m)
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        status: 'Not Started',
        deadline: '',
        members: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectsAPI.update(editingProject._id, formData);
        toast.success('Project updated successfully');
      } else {
        await projectsAPI.create(formData);
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        toast.success('Project deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Manage and track your team projects</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="input-field py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div key={project._id} className="glass-card p-6 flex flex-col hover:border-white/20 transition-all cursor-pointer group" onClick={() => navigate(`/projects/${project._id}/tasks`)}>
            <div className="flex justify-between items-start mb-4">
              <Badge label={project.status} />
              {(user?.role === 'Admin' || user?._id === project.manager?._id || user?._id === project.manager) && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleOpenModal(project)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(project._id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 truncate">{project.title}</h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2 h-10">{project.description}</p>
            
            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar size={14} />
                <span>Deadline: {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'No deadline'}</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 4).map((member, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-900 bg-primary-600 flex items-center justify-center text-xs font-bold text-white" title={member.name}>
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-dark-900 bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <span className="font-semibold text-white">{project.members?.length || 0}</span> members
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProject ? 'Edit Project' : 'Create New Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Title</label>
            <input
              type="text"
              className="input-field"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea
              className="input-field h-24 resize-none"
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Status</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="input-label">Deadline</label>
              <input
                type="date"
                className="input-field"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="input-label">Team Members</label>
            <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-white/5 rounded-lg border border-white/10">
              {users.map(u => (
                <label key={u._id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary-600 focus:ring-primary-500/50"
                    checked={formData.members.includes(u._id)}
                    onChange={e => {
                      const members = e.target.checked 
                        ? [...formData.members, u._id]
                        : formData.members.filter(id => id !== u._id);
                      setFormData({...formData, members});
                    }}
                  />
                  <div>
                    <p className="text-sm text-white font-medium">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.role}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingProject ? 'Update' : 'Create'} Project</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

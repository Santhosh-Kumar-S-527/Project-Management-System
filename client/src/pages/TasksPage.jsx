import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksAPI, projectsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Filter, ArrowLeft, 
  MoreVertical, Calendar, User as UserIcon,
  CheckCircle2, Circle, Clock, AlertCircle,
  GripVertical
} from 'lucide-react';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function TasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To-do',
    priority: 'Medium',
    assignedTo: '',
    deadline: '',
    projectId: projectId
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectsAPI.getById(projectId),
        tasksAPI.getByProject(projectId)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setMembers(projectRes.data.members || []);
    } catch (error) {
      toast.error('Failed to fetch project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        projectId: projectId
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'To-do',
        priority: 'Medium',
        assignedTo: '',
        deadline: '',
        projectId: projectId
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await tasksAPI.update(editingTask._id, formData);
        toast.success('Task updated');
      } else {
        await tasksAPI.create(formData);
        toast.success('Task created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to save task');
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const taskToUpdate = tasks.find(t => t._id === draggableId);
    
    // Optimistic UI update
    const updatedTasks = tasks.map(t => 
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await tasksAPI.update(draggableId, { status: newStatus });
    } catch (error) {
      toast.error('Failed to update task status');
      fetchData(); // Rollback
    }
  };

  const columns = {
    'To-do': tasks.filter(t => t.status === 'To-do' && t.title.toLowerCase().includes(searchQuery.toLowerCase())),
    'In Progress': tasks.filter(t => t.status === 'In Progress' && t.title.toLowerCase().includes(searchQuery.toLowerCase())),
    'Done': tasks.filter(t => t.status === 'Done' && t.title.toLowerCase().includes(searchQuery.toLowerCase())),
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/projects')} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{project?.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge label={project?.status} />
            <span className="text-slate-500 text-sm">•</span>
            <span className="text-slate-500 text-sm">{tasks.length} Tasks</span>
          </div>
        </div>
        <div className="ml-auto">
          <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
          {Object.entries(columns).map(([columnId, columnTasks]) => (
            <div key={columnId} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-slate-300 flex items-center gap-2">
                  {columnId === 'To-do' && <Circle size={16} className="text-slate-500" />}
                  {columnId === 'In Progress' && <Clock size={16} className="text-primary-400" />}
                  {columnId === 'Done' && <CheckCircle2 size={16} className="text-emerald-400" />}
                  {columnId}
                  <span className="ml-1 px-2 py-0.5 text-xs bg-white/5 rounded-full text-slate-500 font-normal">
                    {columnTasks.length}
                  </span>
                </h3>
              </div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[500px] rounded-xl transition-colors ${
                      snapshot.isDraggingOver ? 'bg-white/5' : 'bg-transparent'
                    }`}
                  >
                    <div className="space-y-3 p-1">
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => navigate(`/tasks/${task._id}`)}
                              className={`glass-card p-4 hover:border-white/20 transition-all cursor-pointer group ${
                                snapshot.isDragging ? 'shadow-2xl border-primary-500/50 scale-[1.02]' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <Badge label={task.priority} />
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(task);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                                >
                                  <MoreVertical size={14} className="text-slate-500" />
                                </button>
                              </div>
                              <h4 className="text-white font-medium mb-1 line-clamp-2">{task.title}</h4>
                              <p className="text-slate-500 text-xs mb-4 line-clamp-2">{task.description}</p>
                              
                              <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                  <Calendar size={12} />
                                  <span>{task.deadline ? format(new Date(task.deadline), 'MMM d') : 'No date'}</span>
                                </div>
                                {task.assignedTo && (
                                  <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white border border-dark-900" title={task.assignedTo.name}>
                                    {task.assignedTo.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTask ? 'Edit Task' : 'Add New Task'}
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
              <label className="input-label">Priority</label>
              <select
                className="input-field"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Assigned To</label>
              <select
                className="input-field"
                value={formData.assignedTo}
                onChange={e => setFormData({...formData, assignedTo: e.target.value})}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Status</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="To-do">To-do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingTask ? 'Update' : 'Create'} Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

import { 
  ArrowLeft, Calendar, User as UserIcon, AlertCircle, 
  MessageSquare, Paperclip, Send, Trash2, Clock, CheckCircle2
} from 'lucide-react';
import Badge from '../components/Badge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const res = await tasksAPI.getById(taskId);
      setTask(res.data);
    } catch (error) {
      toast.error('Task not found');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      await tasksAPI.addComment(taskId, { text: comment });
      setComment('');
      fetchTask();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const loadId = toast.loading('Uploading file...');
    try {
      await tasksAPI.uploadFile(taskId, formData);
      toast.success('File uploaded', { id: loadId });
      fetchTask();
    } catch (error) {
      toast.error('Upload failed', { id: loadId });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} /> Back to tasks
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Comments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <Badge label={task.priority} />
                <Badge label={task.status} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">{task.title}</h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare size={18} className="text-primary-400" />
              Comments ({task.comments?.length || 0})
            </h3>

            <div className="space-y-6 mb-8">
              {task.comments?.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No comments yet. Start the conversation!</p>
              ) : (
                task.comments.map((c, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {c.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{c.userId?.name || 'User'}</span>
                        <span className="text-[10px] text-slate-500">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-slate-300">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="input-field h-24 resize-none pr-12"
              />
              <button
                type="submit"
                disabled={submittingComment || !comment.trim()}
                className="absolute right-3 bottom-3 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Meta & Attachments */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Assigned To</h4>
              {task.assignedTo ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{task.assignedTo.name}</p>
                    <p className="text-xs text-slate-500">{task.assignedTo.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No one assigned</p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Deadline</h4>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar size={16} className="text-primary-400" />
                <span className="text-sm">
                  {task.deadline ? format(new Date(task.deadline), 'MMMM d, yyyy') : 'No deadline set'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Project</h4>
              <div className="flex items-center gap-2 text-slate-300">
                <Badge label={task.projectId?.title || 'Unknown Project'} className="!bg-primary-500/10 !text-primary-400 cursor-pointer hover:bg-primary-500/20" onClick={() => navigate(`/projects/${task.projectId?._id}/tasks`)} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Paperclip size={16} className="text-primary-400" />
                Attachments
              </h3>
              <label className="cursor-pointer text-xs text-primary-400 hover:text-primary-300 transition-colors">
                Add
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="space-y-2">
              {task.attachments?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No files attached</p>
              ) : (
                task.attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 group">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip size={14} className="text-slate-500" />
                      <span className="text-xs text-slate-300 truncate">{file.split('/').pop()}</span>
                    </div>
                    <a 
                      href={file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

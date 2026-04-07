import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, tasksAPI, usersAPI } from '../services/api';
import { FolderKanban, CheckSquare, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import Badge from '../components/Badge';
import { format, isPast } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } },
  },
};

const barOptions = {
  ...chartOptions,
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pr, us] = await Promise.all([
          projectsAPI.getAll(),
          usersAPI.getAll(),
        ]);
        setProjects(pr.data);
        setUsers(us.data);
        // Load tasks for all projects
        const taskResults = await Promise.all(
          pr.data.map(p => tasksAPI.getByProject(p._id).catch(() => ({ data: [] })))
        );
        setTasks(taskResults.flatMap(r => r.data));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Derived stats
  const projectStats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'Completed').length,
    inProgress: projects.filter(p => p.status === 'In Progress').length,
    notStarted: projects.filter(p => p.status === 'Not Started').length,
  };

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'To-do').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length,
    overdue: tasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && t.status !== 'Done').length,
  };

  const doughnutData = {
    labels: ['Not Started', 'In Progress', 'Completed'],
    datasets: [{
      data: [projectStats.notStarted, projectStats.inProgress, projectStats.completed],
      backgroundColor: ['rgba(100,116,139,0.8)', 'rgba(59,130,246,0.8)', 'rgba(34,197,94,0.8)'],
      borderColor: ['#64748b', '#3b82f6', '#22c55e'],
      borderWidth: 1,
    }],
  };

  const barData = {
    labels: ['To-do', 'In Progress', 'Done', 'Overdue'],
    datasets: [{
      label: 'Tasks',
      data: [taskStats.todo, taskStats.inProgress, taskStats.done, taskStats.overdue],
      backgroundColor: [
        'rgba(100,116,139,0.7)',
        'rgba(59,130,246,0.7)',
        'rgba(34,197,94,0.7)',
        'rgba(239,68,68,0.7)',
      ],
      borderRadius: 8,
    }],
  };

  const recentProjects = [...projects].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  ).slice(0, 5);

  const overdueTasks = tasks.filter(
    t => t.deadline && isPast(new Date(t.deadline)) && t.status !== 'Done'
  ).slice(0, 5);

  const statCards = [
    { label: 'Total Projects', value: projectStats.total, icon: FolderKanban, color: 'from-primary-500 to-blue-600', bg: 'bg-primary-500/10' },
    { label: 'Total Tasks', value: taskStats.total, icon: CheckSquare, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10' },
    { label: 'Team Members', value: users.length, icon: Users, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-500/10' },
    { label: 'Overdue Tasks', value: taskStats.overdue, icon: AlertCircle, color: 'from-red-500 to-rose-600', bg: 'bg-red-500/10' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 
        </h1>
        <p className="text-slate-400 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} className={`bg-gradient-to-br ${color} bg-clip-text`} style={{ color: 'transparent', filter: 'none' }} />
              <Icon size={22} className="absolute opacity-0" />
              {/* Use plain icon with matching gradient */}
              <div className={`absolute w-12 h-12 rounded-xl bg-gradient-to-br ${color} opacity-0`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Donut */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" /> Project Status
          </h2>
          <div className="h-56 flex items-center justify-center">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>

        {/* Task Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckSquare size={18} className="text-emerald-400" /> Task Overview
          </h2>
          <div className="h-56">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FolderKanban size={18} className="text-primary-400" /> Recent Projects
          </h2>
          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-slate-500 text-sm">No projects yet</p>
            ) : recentProjects.map(p => (
              <div key={p._id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {p.deadline ? format(new Date(p.deadline), 'MMM d, yyyy') : 'No deadline'}
                  </p>
                </div>
                <Badge label={p.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-red-400" /> Overdue Tasks
          </h2>
          <div className="space-y-3">
            {overdueTasks.length === 0 ? (
              <p className="text-slate-500 text-sm"> No overdue tasks!</p>
            ) : overdueTasks.map(t => (
              <div key={t._id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{t.title}</p>
                  <p className="text-red-400 text-xs mt-0.5">
                    Due {format(new Date(t.deadline), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge label={t.priority} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

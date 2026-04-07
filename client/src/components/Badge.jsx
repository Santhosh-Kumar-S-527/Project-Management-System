import clsx from 'clsx';

const variants = {
  // Status
  'Not Started': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'In Progress': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Completed': 'bg-green-500/20 text-green-300 border-green-500/30',

  // Task status
  'To-do': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'Done': 'bg-green-500/20 text-green-300 border-green-500/30',

  // Priority
  'High': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Medium': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Low': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',

  // Role
  'Admin': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Manager': 'bg-primary-500/20 text-primary-300 border-primary-500/30',
  'User': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

export default function Badge({ label, className }) {
  return (
    <span className={clsx(
      'badge border',
      variants[label] || 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      className
    )}>
      {label}
    </span>
  );
}

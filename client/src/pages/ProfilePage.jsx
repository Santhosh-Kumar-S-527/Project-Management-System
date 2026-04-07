import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { 
  User as UserIcon, Mail, Shield, Camera, 
  Settings, Key, LogOut, Save, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await usersAPI.update(user.id || user._id, {
        name: formData.name,
        email: formData.email
      });
      updateUser(res.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    
    setLoading(true);
    try {
      await usersAPI.update(user.id || user._id, {
        password: formData.newPassword
      });
      toast.success('Password changed successfully');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-primary-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-dark-800 border border-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
              <Camera size={14} />
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
          <p className="text-sm text-slate-500 mb-4">{user?.email}</p>
          
          <div className="flex gap-2 mb-6">
            <Badge label={user?.role} />
          </div>

          <div className="w-full space-y-2 text-left pt-6 border-t border-white/5">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-500">Member Since</span>
              <span className="text-slate-300">{new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-500">Workspaces</span>
              <span className="text-slate-300">1 Default</span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full mt-6 btn-secondary !text-red-400 !border-red-400/20 hover:!bg-red-500/10 justify-center"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Settings Column */}
        <div className="md:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Settings size={18} className="text-primary-400" />
              General Information
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="input-field"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading} className="btn-primary">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Security Settings */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Key size={18} className="text-purple-400" />
              Security & Password
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="input-label">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="••••••••"
                  className="input-field"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    className="input-field"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="input-label">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="input-field"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading} className="btn-secondary">
                  Update Password <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

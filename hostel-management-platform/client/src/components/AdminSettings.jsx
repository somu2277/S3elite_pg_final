import React, { useState } from 'react';
import { User, Mail, Lock, ShieldCheck, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const adminData = JSON.parse(localStorage.getItem('s3elite_admin'));
  const token = adminData?.token;
  const currentEmail = adminData?.email || 'N/A';

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setError('Current password is required to make changes');
      return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/auth/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newEmail, newPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Credentials updated successfully!');
        // Update local storage with new token and user data
        const updatedAdmin = {
          ...adminData,
          token: data.token,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role
        };
        localStorage.setItem('s3elite_admin', JSON.stringify(updatedAdmin));
        
        setCurrentPassword('');
        setNewEmail('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Failed to update credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-textDark tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Admin Settings
          </h2>
          <p className="text-xs text-textMuted mt-1">
            Update your enterprise management credentials securely
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-borderLight p-6 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center border-2 border-white shadow-md mb-4">
              <User className="w-10 h-10 text-textMuted" />
            </div>
            <h3 className="text-lg font-bold text-textDark">{adminData?.name || 'Admin'}</h3>
            <p className="text-xs font-bold text-primary mt-1 uppercase tracking-wider">{adminData?.role || 'ERP Manager'}</p>
            <div className="mt-4 pt-4 border-t border-borderLight text-left space-y-2">
              <p className="text-xs text-textMuted flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> {currentEmail}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 shadow-sm">
            <h4 className="text-xs font-bold text-amber-700 flex items-center gap-1.5 uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4" /> Security Notice
            </h4>
            <p className="text-[10px] text-amber-600 leading-relaxed">
              Changing your email or password will immediately update your login credentials. You will need to use the new credentials for all future logins.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-borderLight p-6 shadow-sm">
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="border-b border-borderLight pb-4 mb-4">
                <h3 className="text-sm font-bold text-textDark uppercase tracking-wider mb-1">Authentication Required</h3>
                <p className="text-xs text-textMuted">Please verify your current password to make changes.</p>
                <div className="mt-4">
                  <label className="block text-xs font-bold text-textDark mb-1.5">Current Password <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-textMuted" />
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-borderLight rounded-xl text-sm text-textDark focus:border-primary focus:outline-none"
                      required
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-2.5 text-textMuted hover:text-textDark"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-textDark uppercase tracking-wider mb-4">Update Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-textDark mb-1.5">New Email Address (Optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-textMuted" />
                      <input 
                        type="email" 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-borderLight rounded-xl text-sm text-textDark focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-textDark mb-1.5">New Password (Optional)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-textMuted" />
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-borderLight rounded-xl text-sm text-textDark focus:border-primary focus:outline-none"
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-2.5 text-textMuted hover:text-textDark"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPassword && newPassword.length < 6 && (
                      <p className="text-[10px] text-rose-500 mt-1 font-bold">Password must be at least 6 characters</p>
                    )}
                  </div>

                  {newPassword && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-xs font-bold text-textDark mb-1.5">Confirm New Password <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-textMuted" />
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your new password"
                          className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-borderLight rounded-xl text-sm text-textDark focus:border-primary focus:outline-none"
                          required={!!newPassword}
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-2.5 text-textMuted hover:text-textDark"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}

              {message && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs p-3 rounded-xl flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4" /> {message}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !currentPassword || (!newEmail && !newPassword)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    loading || !currentPassword || (!newEmail && !newPassword)
                      ? 'bg-slate-100 text-textMuted cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-primaryHover shadow-md shadow-orange-500/20'
                  }`}
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {loading ? 'Updating Credentials...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

import React from 'react';
import { useAuth, ROLE_ACCOUNTS } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { Sparkles, RotateCcw, GraduationCap, Wrench, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DemoRoleSwitcher = () => {
  const { currentRole, switchRole } = useAuth();
  const { resetDemoData } = useComplaints();
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    switchRole(role);
    if (role === 'student') {
      navigate('/student/dashboard');
    } else if (role === 'staff') {
      navigate('/staff/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-400" />
          Presentation Mode:
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Switch role instantly to test workflows:
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => handleRoleChange('student')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            currentRole === 'student'
              ? 'bg-brand-600 text-white shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student</span>
          <span className="text-[10px] opacity-75 hidden md:inline">({ROLE_ACCOUNTS.student.name.split(' ')[0]})</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange('staff')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            currentRole === 'staff'
              ? 'bg-brand-600 text-white shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Staff</span>
          <span className="text-[10px] opacity-75 hidden md:inline">({ROLE_ACCOUNTS.staff.name.split(' ')[0]})</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange('admin')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            currentRole === 'admin'
              ? 'bg-brand-600 text-white shadow'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>

        <button
          type="button"
          onClick={resetDemoData}
          title="Reset sample complaints to initial seed"
          className="ml-2 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden lg:inline text-[11px]">Reset Data</span>
        </button>
      </div>
    </div>
  );
};

export default DemoRoleSwitcher;

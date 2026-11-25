import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import {
  LayoutDashboard,
  FileText,
  Bot,
  UserCheck,
  History,
  Users,
  Building,
  BarChart3,
  FileSpreadsheet,
  User,
  LogOut,
  Sparkles,
  Menu,
} from 'lucide-react';

const Sidebar = ({ isMobile = false, onClose, isCollapsed = false, onToggleCollapse }) => {
  const { currentRole, logout } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  // Badges calculation
  const pendingCount = complaints.filter(
    (c) => c.status === 'Pending' || c.status === 'Pending Review'
  ).length;
  const assignedCount = complaints.filter(
    (c) => c.status === 'Assigned' || c.status === 'In Progress'
  ).length;

  // Student Links: "Create Complaint" removed as required; accessible via My Complaints
  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/complaints', label: 'My Complaints', icon: FileText },
    {
      to: '/student/ai-assistant',
      label: 'AI Assistant',
      icon: Bot,
      highlight: true,
    },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      to: '/staff/assigned',
      label: 'Assigned Complaints',
      icon: UserCheck,
      badge: assignedCount > 0 ? assignedCount : null,
    },
    { to: '/staff/history', label: 'Work History', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      to: '/admin/complaints',
      label: 'All Complaints',
      icon: FileText,
      badge: pendingCount > 0 ? `${pendingCount} new` : null,
    },
    { to: '/admin/staff', label: 'Staff Management', icon: UserCheck },
    { to: '/admin/students', label: 'Student Directory', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Building },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/reports', label: 'Reports', icon: FileSpreadsheet },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const getRoleLinks = () => {
    switch (currentRole) {
      case 'admin':
        return adminLinks;
      case 'staff':
        return staffLinks;
      default:
        return studentLinks;
    }
  };

  const links = getRoleLinks();
  const collapsed = isCollapsed && !isMobile;

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-slate-200/80 flex flex-col justify-between h-full select-none transition-all duration-300 ease-in-out`}
    >
      <div className="p-3 sm:p-4">
        {/* Role Portal Header & Toggle Button */}
        {collapsed ? (
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="p-2 rounded-xl text-brand-600 bg-brand-50 hover:bg-brand-100 hover:text-brand-700 transition-colors focus:outline-none shadow-xs"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Workspace
              </p>
              <div className="mt-0.5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 capitalize truncate">
                  {currentRole === 'admin'
                    ? 'Campus Administrator'
                    : currentRole === 'staff'
                    ? 'Staff Technician Portal'
                    : 'Student Portal'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 ml-1.5" />
              </div>
            </div>

            {!isMobile && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Navigation Items */}
        {!collapsed && (
          <nav className="space-y-1.5">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                        : item.highlight
                        ? 'bg-gradient-to-r from-brand-50 to-accent-50 text-brand-700 hover:from-brand-100 hover:to-accent-100 border border-brand-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.highlight && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-600 text-white flex items-center gap-0.5 shadow-xs flex-shrink-0 ml-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI
                    </span>
                  )}

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0 ml-1">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>

      {/* Bottom Footer Section */}
      {!collapsed && (
        <div className="p-3 sm:p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign Out"
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

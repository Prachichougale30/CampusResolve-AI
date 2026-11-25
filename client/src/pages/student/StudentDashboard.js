import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import StatCard from '../../components/common/StatCard';
import StatusDonutChart from '../../components/charts/StatusDonutChart';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import {
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
  PlusCircle,
  Bot,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { complaints } = useComplaints();

  // Filter complaints filed by this student (or show all if demo student)
  const studentComplaints = complaints.filter(
    (c) => c.student?.email === user?.email || c.student?.id === user?.id || !c.student
  );

  const total = studentComplaints.length;
  const pending = studentComplaints.filter((c) => c.status === 'Pending' || c.status === 'Pending Review').length;
  const inProgress = studentComplaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolved = studentComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Verified').length;

  const statusCounts = studentComplaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const recentComplaints = studentComplaints.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-indigo-900 to-accent-950 p-6 sm:p-8 rounded-3xl text-white shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/20 text-brand-200 border border-brand-500/30">
              Student Dashboard
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-300 font-medium">
              {user?.department || 'Computer Science'} ({user?.rollNo || 'CS2024-042'})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Prachi'} 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
            Report campus issues, track maintenance repairs in real time, and confirm resolution through verified student feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/complaints?create=true"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4 text-brand-600" />
            <span>Report New Issue</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Complaints"
          value={total}
          icon={FileText}
          color="indigo"
          trend={12}
          trendLabel="total tracked"
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={Clock}
          color="amber"
          badgeText="Review / Assignment"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={PlayCircle}
          color="purple"
          badgeText="Work Underway"
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle2}
          color="emerald"
          badgeText="Ready to verify"
        />
      </div>

      {/* AI Assistant Shortcut Card (Highlighted) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-600 p-6 sm:p-7 text-white shadow-xl shadow-brand-500/15">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
              <Bot className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  Need help reporting an issue?
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-brand-700 shadow-xs">
                  AI ASSISTANT
                </span>
              </div>
              <p className="mt-1 text-xs text-indigo-100 max-w-xl leading-relaxed">
                Talk to CampusResolve AI and describe your problem naturally. The assistant identifies location and automatically categorizes your complaint.
              </p>
            </div>
          </div>

          <Link
            to="/student/ai-assistant"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-700 hover:bg-slate-100 font-extrabold text-xs shadow-md transition-all hover:scale-105 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-accent-600" />
            <span>Open AI Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Status Donut Chart & Recent Complaints Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Complaints */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Complaints</h2>
              <p className="text-xs text-slate-500">
                Latest issues submitted from your student account
              </p>
            </div>
            <Link
              to="/student/complaints"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Table on Desktop */}
          <div className="hidden md:block">
            <ComplaintTable complaints={recentComplaints} role="student" />
          </div>

          {/* Cards on Mobile */}
          <div className="md:hidden space-y-3">
            {recentComplaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} role="student" />
            ))}
          </div>
        </div>

        {/* Right Col: Complaint Status Overview Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Status Overview</h3>
                <p className="text-xs text-slate-500">Complaint resolution ratio</p>
              </div>
              <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>

            <StatusDonutChart statusCounts={statusCounts} />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/student/complaints"
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Track all {total} tickets in detail →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

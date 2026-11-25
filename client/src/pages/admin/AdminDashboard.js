import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import StatCard from '../../components/common/StatCard';
import StatusDonutChart from '../../components/charts/StatusDonutChart';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import AssignModal from '../../components/complaints/AssignModal';
import {
  FileText,
  Clock,
  UserCheck,
  PlayCircle,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  BarChart3,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const AdminDashboard = () => {
  const { complaints } = useComplaints();
  const navigate = useNavigate();
  const [assignModalComplaint, setAssignModalComplaint] = useState(null);

  // 6 Core Stat Counts
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending' || c.status === 'Pending Review').length;
  const assigned = complaints.filter((c) => c.status === 'Assigned').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const verified = complaints.filter((c) => c.status === 'Verified').length;

  const statusCounts = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  // Category counts for pie chart
  const categoryCounts = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const recentComplaints = complaints.slice(0, 6);
  const unassignedComplaint = complaints.find((c) => c.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Admin Control Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 p-6 sm:p-8 rounded-3xl text-white shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-200 border border-rose-500/30">
              Campus Administration Hub
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-300 font-medium">
              Apex Institute of Technology & Engineering
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            Operations & Resource Control Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
            Real-time campus maintenance monitoring, automated AI ticket routing, and service resolution analytics.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (unassignedComplaint) setAssignModalComplaint(unassignedComplaint);
              else navigate('/admin/complaints');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-105"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Complaint</span>
          </button>

          <Link
            to="/admin/staff"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff</span>
          </Link>

          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Analytics</span>
          </Link>
        </div>
      </div>

      {/* 6 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Issues"
          value={total}
          icon={FileText}
          color="indigo"
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={Clock}
          color="amber"
          badgeText="Review / Assign"
        />
        <StatCard
          title="Assigned"
          value={assigned}
          icon={UserCheck}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={PlayCircle}
          color="purple"
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Verified"
          value={verified}
          icon={ShieldCheck}
          color="teal"
          badgeText="Closed"
        />
      </div>

      {/* Analytics & Distribution Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution Donut */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">
              Complaint Status Overview
            </h3>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Proportion of active vs closed tickets
          </p>
          <StatusDonutChart statusCounts={statusCounts} />
        </div>

        {/* Category Breakdown Pie */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Departmental Load by AI Category
              </h3>
              <p className="text-xs text-slate-500">
                Automatic AI classification breakdown across 10 campus categories
              </p>
            </div>
            <Link
              to="/admin/analytics"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <CategoryPieChart data={categoryChartData} />
        </div>
      </div>

      {/* Recent Campus Complaints Table with Admin Quick Assign */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Campus Complaints
            </h2>
            <p className="text-xs text-slate-500">
              Latest issues reported campus-wide across hostels, classrooms, and labs
            </p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Manage All ({total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ComplaintTable
          complaints={recentComplaints}
          role="admin"
          onAssign={(c) => setAssignModalComplaint(c)}
        />
      </div>

      {/* Assign Modal */}
      <AssignModal
        isOpen={!!assignModalComplaint}
        onClose={() => setAssignModalComplaint(null)}
        complaint={assignModalComplaint}
      />
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import RemarkModal from '../../components/complaints/RemarkModal';
import {
  Wrench,
  Clock,
  PlayCircle,
  CheckCircle2,
  MapPin,
  Eye,
  MessageSquarePlus,
  Play,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { isAssignedToStaff } from '../../utils/complaintAccess';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { complaints, startWork } = useComplaints();
  const [activeRemarkComplaint, setActiveRemarkComplaint] = useState(null);

  const staffComplaints = complaints.filter((complaint) =>
    isAssignedToStaff(complaint, user)
  );

  const assignedCount = staffComplaints.filter((c) => c.status === 'Assigned').length;
  const inProgressCount = staffComplaints.filter((c) => c.status === 'In Progress').length;
  const resolvedToday = staffComplaints.filter((c) => c.status === 'Resolved').length;
  const totalResolved = staffComplaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Verified'
  ).length;

  const activeWorkList = staffComplaints.filter(
    (c) => c.status === 'Assigned' || c.status === 'In Progress'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 p-6 sm:p-8 rounded-3xl text-white shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/20 text-brand-200 border border-brand-500/30">
              Staff Technician Portal
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-300 font-medium">
              {user?.name} ({user?.department || 'Electrical'} Dept)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            Maintenance & Repairs Dispatch
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
            Review allocated work orders, record on-site inspection findings, and mark tasks resolved.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/staff/assigned"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition-all hover:scale-105"
          >
            <Wrench className="w-4 h-4 text-brand-600" />
            <span>Assigned Work ({activeWorkList.length})</span>
          </Link>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Assigned Complaints"
          value={assignedCount}
          icon={Clock}
          color="blue"
          badgeText="Pending Work Start"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={PlayCircle}
          color="purple"
          badgeText="Work Underway"
        />
        <StatCard
          title="Resolved Today"
          value={resolvedToday}
          icon={CheckCircle2}
          color="emerald"
          badgeText="Awaiting Student"
        />
        <StatCard
          title="Total Resolved"
          value={totalResolved}
          icon={TrendingUp}
          color="teal"
          badgeText="All Time Fixes"
        />
      </div>

      {/* Active Work Orders Table/Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Assigned Campus Complaints
            </h2>
            <p className="text-xs text-slate-500">
              Actionable maintenance issues assigned to your department
            </p>
          </div>
          <Link
            to="/staff/assigned"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All ({staffComplaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeWorkList.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-900">No active work orders pending!</p>
            <p className="text-xs text-slate-500 mt-1">
              All assigned complaints have been addressed. Check your work history.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeWorkList.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-brand-600">
                        #{complaint.id}
                      </span>
                      <CategoryBadge category={complaint.category} isAiDetected={complaint.isAiDetected} size="sm" />
                    </div>
                    <StatusBadge status={complaint.status} size="sm" />
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {complaint.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {complaint.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{complaint.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>Student: {complaint.student?.name}</span>
                      <span>Assigned: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Staff Actions Bar */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  {complaint.status === 'Assigned' && (
                    <button
                      type="button"
                      onClick={() => startWork(complaint.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Work</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveRemarkComplaint(complaint)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition-colors"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Add Remarks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRemarkComplaint(complaint)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>

                  <Link
                    to={`/staff/complaints/${complaint.id}`}
                    className="ml-auto inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Remark / Resolution Modal */}
      <RemarkModal
        isOpen={!!activeRemarkComplaint}
        onClose={() => setActiveRemarkComplaint(null)}
        complaint={activeRemarkComplaint}
      />
    </div>
  );
};

export default StaffDashboard;

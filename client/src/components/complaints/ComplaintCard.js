import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import { MapPin, Calendar, User, ChevronRight, UserCheck, Play, MessageSquarePlus, Check, X } from 'lucide-react';

const ComplaintCard = ({
  complaint,
  role = 'student',
  onAssign,
  onApprove,
  onReject,
  onAddRemark,
  onStartWork,
}) => {
  const getDetailPath = (id) => {
    if (role === 'admin') return `/admin/complaints/${id}`;
    if (role === 'staff') return `/staff/complaints/${id}`;
    return `/student/complaints/${id}`;
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header: ID, Category & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs text-brand-600">
              #{complaint.id}
            </span>
            <CategoryBadge
              category={complaint.category}
              isAiDetected={complaint.isAiDetected}
              size="sm"
            />
          </div>
          <StatusBadge status={complaint.status} size="sm" />
        </div>

        {/* Title & Description */}
        <Link
          to={getDetailPath(complaint.id)}
          className="block font-bold text-slate-900 hover:text-brand-600 transition-colors text-sm sm:text-base leading-snug"
        >
          {complaint.title}
        </Link>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        {/* Location & Info */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{complaint.location}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(complaint.createdAt).toLocaleDateString()}
            </span>

            {complaint.assignedStaff && (
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <User className="w-3 h-3 text-brand-600" />
                {complaint.assignedStaff.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {role === 'admin' && complaint.status === 'Pending Review' ? (
          <div className="flex flex-1 gap-2">
            <button
              type="button"
              onClick={() => onApprove?.(complaint)}
              className="flex-1 py-1.5 px-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => onReject?.(complaint)}
              className="flex-1 py-1.5 px-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        ) : role === 'admin' && complaint.status === 'Pending' && !complaint.assignedStaff && onAssign ? (
          <button
            type="button"
            onClick={() => onAssign(complaint)}
            className="flex-1 py-1.5 px-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Assign Staff
          </button>
        ) : role === 'staff' && complaint.status === 'Assigned' && onStartWork ? (
          <button
            type="button"
            onClick={() => onStartWork(complaint.id)}
            className="flex-1 py-1.5 px-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            Start Work
          </button>
        ) : role === 'staff' && (complaint.status === 'In Progress' || complaint.status === 'Assigned') && onAddRemark ? (
          <button
            type="button"
            onClick={() => onAddRemark(complaint)}
            className="flex-1 py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            Add Remark
          </button>
        ) : null}

        <Link
          to={getDetailPath(complaint.id)}
          className="inline-flex items-center justify-center gap-1 py-1.5 px-3 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors ml-auto"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ComplaintCard;

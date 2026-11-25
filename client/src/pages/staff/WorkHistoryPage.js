import React from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { CheckCircle2, Star, MapPin, Eye } from 'lucide-react';
import { isAssignedToStaff } from '../../utils/complaintAccess';

const WorkHistoryPage = () => {
  const { complaints } = useComplaints();
  const { user } = useAuth();

  const historyList = complaints.filter(
    (c) =>
      (c.status === 'Resolved' || c.status === 'Verified') &&
      isAssignedToStaff(c, user)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Completed Work History
        </h1>
        <p className="text-xs text-slate-500">
          Archive of resolved and verified campus maintenance tasks and student feedback ratings.
        </p>
      </div>

      {historyList.length === 0 ? (
        <EmptyState
          title="No completed work history yet"
          description="Resolved and verified issues will be archived here along with student satisfaction ratings."
        />
      ) : (
        <div className="space-y-4">
          {historyList.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft hover:shadow-card-hover transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-brand-600">
                    #{complaint.id}
                  </span>
                  <CategoryBadge category={complaint.category} isAiDetected={complaint.isAiDetected} size="sm" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Resolved: {new Date(complaint.updatedAt).toLocaleDateString()}
                  </span>
                  <StatusBadge status={complaint.status} size="sm" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {complaint.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {complaint.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{complaint.location}</span>
                </div>
              </div>

              {/* Student Feedback Rating Callout */}
              {complaint.feedback && (
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-bold text-teal-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      Student Feedback
                    </span>
                    {complaint.feedback.comment && (
                      <p className="text-slate-600 italic">
                        "{complaint.feedback.comment}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                    {[...Array(complaint.feedback.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">
                      {complaint.feedback.rating}.0
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end">
                <Link
                  to={`/staff/complaints/${complaint.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Case Record</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkHistoryPage;

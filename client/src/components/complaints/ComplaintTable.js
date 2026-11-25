import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import { MapPin, Eye, UserCheck, Play, Check, X } from 'lucide-react';

const ComplaintTable = ({
  complaints = [],
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
    <div className="overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Ticket ID
              </th>
              <th scope="col" className="px-5 py-3.5">
                Issue Title & Description
              </th>
              <th scope="col" className="px-5 py-3.5">
                Category
              </th>
              <th scope="col" className="px-5 py-3.5">
                Location
              </th>
              <th scope="col" className="px-5 py-3.5">
                Status
              </th>
              {role === 'admin' && (
                <th scope="col" className="px-5 py-3.5">
                  Assigned Staff
                </th>
              )}
              <th scope="col" className="px-5 py-3.5">
                Date
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {complaints.map((complaint) => (
              <tr
                key={complaint.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {/* ID */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <Link
                    to={getDetailPath(complaint.id)}
                    className="font-bold text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline"
                  >
                    #{complaint.id}
                  </Link>
                </td>

                {/* Title */}
                <td className="px-5 py-4 max-w-xs sm:max-w-sm">
                  <div className="font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {complaint.title}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {complaint.description}
                  </p>
                </td>

                {/* Category */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <CategoryBadge
                    category={complaint.category}
                    isAiDetected={complaint.isAiDetected}
                    size="sm"
                  />
                </td>

                {/* Location */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[150px]">{complaint.location}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <StatusBadge status={complaint.status} size="sm" />
                </td>

                {/* Assigned Staff (Admin Only) */}
                {role === 'admin' && (
                  <td className="px-5 py-4 whitespace-nowrap">
                    {complaint.assignedStaff ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={complaint.assignedStaff.avatar}
                          alt={complaint.assignedStaff.name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="font-semibold text-slate-800">
                          {complaint.assignedStaff.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
                        Unassigned
                      </span>
                    )}
                  </td>
                )}

                {/* Date */}
                <td className="px-5 py-4 whitespace-nowrap text-slate-500 text-[11px]">
                  {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>

                {/* Actions */}
                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Admin quick assign */}
                    {role === 'admin' && complaint.status === 'Pending Review' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove?.(complaint)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject?.(complaint)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {role === 'admin' && complaint.status === 'Pending' && !complaint.assignedStaff && onAssign && (
                      <button
                        type="button"
                        onClick={() => onAssign(complaint)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition-colors"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Assign</span>
                      </button>
                    )}

                    {/* Staff quick actions */}
                    {role === 'staff' && complaint.status === 'Assigned' && onStartWork && (
                      <button
                        type="button"
                        onClick={() => onStartWork(complaint.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start</span>
                      </button>
                    )}

                    {role === 'staff' && (complaint.status === 'In Progress' || complaint.status === 'Assigned') && onAddRemark && (
                      <button
                        type="button"
                        onClick={() => onAddRemark(complaint)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <span>Update</span>
                      </button>
                    )}

                    <Link
                      to={getDetailPath(complaint.id)}
                      className="inline-flex items-center gap-1 p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintTable;

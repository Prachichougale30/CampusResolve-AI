import React from 'react';
import { CATEGORIES } from '../../data/mockData';
import { useComplaints } from '../../context/ComplaintContext';
import CategoryBadge from '../../components/common/CategoryBadge';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DepartmentsPage = () => {
  const { complaints, staffList } = useComplaints();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Campus Departments & Facilities
        </h1>
        <p className="text-xs text-slate-500">
          The 10 maintenance categories managed by CampusResolve AI with assigned technical leads and SLAs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((dept) => {
          const deptComplaints = complaints.filter((c) => c.category === dept.id);
          const activeCount = deptComplaints.filter(
            (c) =>
              c.status === 'Pending Review' ||
              c.status === 'Pending' ||
              c.status === 'Assigned' ||
              c.status === 'In Progress'
          ).length;
          const assignedStaff = staffList.filter((s) => s.department === dept.id);

          return (
            <div
              key={dept.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <CategoryBadge category={dept.id} size="md" showAiPill={false} />
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      activeCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {activeCount} active ticket{activeCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {dept.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      Resolution Target SLA
                    </span>
                    <span className="font-bold text-slate-800">&lt; 24 Hours</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      Assigned Staff
                    </span>
                    <span className="font-bold text-slate-800">
                      {assignedStaff.length} technician{assignedStaff.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {deptComplaints.length} lifetime tickets
                </span>
                <Link
                  to="/admin/complaints"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <span>Filter Tickets</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentsPage;

import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import RemarkModal from '../../components/complaints/RemarkModal';
import EmptyState from '../../components/common/EmptyState';
import { Search } from 'lucide-react';
import { isAssignedToStaff } from '../../utils/complaintAccess';

const AssignedComplaintsPage = () => {
  const { complaints, startWork } = useComplaints();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeRemarkComplaint, setActiveRemarkComplaint] = useState(null);

  // Filter complaints assigned to this staff technician
  const staffComplaints = useMemo(() => {
    return complaints.filter((complaint) => isAssignedToStaff(complaint, user));
  }, [complaints, user]);

  const filteredComplaints = useMemo(() => {
    return staffComplaints.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'ALL' && c.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [staffComplaints, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Assigned Complaints & Work Orders
        </h1>
        <p className="text-xs text-slate-500">
          Manage tickets assigned to {user?.department || 'Electrical'} maintenance. Update lifecycle status and add remarks.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assigned complaints..."
            className="w-full pl-10 rounded-xl border-slate-200 text-xs py-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'Assigned', 'In Progress', 'Resolved', 'Verified'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* View */}
      {filteredComplaints.length === 0 ? (
        <EmptyState
          title="No assigned complaints found"
          description="There are currently no maintenance orders matching this filter."
        />
      ) : (
        <>
          <div className="hidden md:block">
            <ComplaintTable
              complaints={filteredComplaints}
              role="staff"
              onStartWork={startWork}
              onAddRemark={(c) => setActiveRemarkComplaint(c)}
            />
          </div>

          <div className="md:hidden space-y-3">
            {filteredComplaints.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                role="staff"
                onStartWork={startWork}
                onAddRemark={(complaint) => setActiveRemarkComplaint(complaint)}
              />
            ))}
          </div>
        </>
      )}

      <RemarkModal
        isOpen={!!activeRemarkComplaint}
        onClose={() => setActiveRemarkComplaint(null)}
        complaint={activeRemarkComplaint}
      />
    </div>
  );
};

export default AssignedComplaintsPage;

import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import AssignModal from '../../components/complaints/AssignModal';
import EmptyState from '../../components/common/EmptyState';
import { CATEGORIES } from '../../data/mockData';
import {
  Search,
  RotateCcw,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminComplaintsPage = () => {
  const { complaints, reviewComplaint } = useComplaints();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [assignModalComplaint, setAssignModalComplaint] = useState(null);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = c.title?.toLowerCase().includes(q);
          const matchDesc = c.description?.toLowerCase().includes(q);
          const matchId = c.id?.toLowerCase().includes(q);
          const matchLoc = c.location?.toLowerCase().includes(q);
          const matchStu = c.student?.name?.toLowerCase().includes(q);
          const matchStaff = c.assignedStaff?.name?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchId && !matchLoc && !matchStu && !matchStaff) return false;
        }

        if (categoryFilter !== 'ALL' && c.category !== categoryFilter) {
          return false;
        }

        if (departmentFilter !== 'ALL' && c.category !== departmentFilter) {
          return false;
        }

        if (statusFilter !== 'ALL' && c.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [complaints, searchQuery, categoryFilter, statusFilter, departmentFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setSortBy('newest');
  };

  const handleReview = async (complaint, decision) => {
    if (
      decision === 'reject' &&
      !window.confirm(`Reject complaint #${complaint.id}? The student will be notified.`)
    ) {
      return;
    }
    await reviewComplaint(complaint.id, decision);
  };

  const handleExportCSV = () => {
    const headers = ['ID,Title,Category,Status,Location,Student,AssignedStaff,CreatedAt'];
    const rows = filteredComplaints.map((c) =>
      `"${c.id}","${c.title.replace(/"/g, '""')}","${c.category}","${c.status}","${c.location}","${c.student?.name || ''}","${c.assignedStaff?.name || 'Unassigned'}","${c.createdAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campusresolve_complaints_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Complaints exported to CSV successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            All Campus Complaints
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive oversight and dispatch controls for all {complaints.length} registered campus tickets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, student, issue, or staff..."
              className="w-full pl-10 rounded-xl border-slate-200 text-xs py-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border-slate-200 text-xs py-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
            >
              <option value="ALL">All Categories ({complaints.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border-slate-200 text-xs py-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending Review">Awaiting Admin Review</option>
              <option value="Pending">Approved · Awaiting Assignment</option>
              <option value="Assigned">Assigned to Staff</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Verified">Verified by Student</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By Date */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border-slate-200 text-xs py-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick status bar */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Quick Filter:</span>
          {['ALL', 'Pending Review', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Verified', 'Rejected'].map((st) => {
            const count =
              st === 'ALL'
                ? complaints.length
                : complaints.filter((c) => c.status === st).length;
            const isSelected = statusFilter === st;

            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Complaints Table */}
      {filteredComplaints.length === 0 ? (
        <EmptyState
          title="No complaints matched your search"
          description="Try broadening your search term or clearing active status and category filters."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <ComplaintTable
              complaints={filteredComplaints}
              role="admin"
              onAssign={(complaint) => setAssignModalComplaint(complaint)}
              onApprove={(complaint) => handleReview(complaint, 'approve')}
              onReject={(complaint) => handleReview(complaint, 'reject')}
            />
          </div>

          <div className="md:hidden space-y-3">
            {filteredComplaints.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                role="admin"
                onAssign={(complaint) => setAssignModalComplaint(complaint)}
                onApprove={(complaint) => handleReview(complaint, 'approve')}
                onReject={(complaint) => handleReview(complaint, 'reject')}
              />
            ))}
          </div>
        </>
      )}

      {/* Staff Assignment Modal */}
      <AssignModal
        isOpen={!!assignModalComplaint}
        onClose={() => setAssignModalComplaint(null)}
        complaint={assignModalComplaint}
      />
    </div>
  );
};

export default AdminComplaintsPage;

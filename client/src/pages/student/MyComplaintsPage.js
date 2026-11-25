import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import EmptyState from '../../components/common/EmptyState';
import CreateComplaintModal from '../../components/complaints/CreateComplaintModal';
import { CATEGORIES } from '../../data/mockData';
import {
  Search,
  PlusCircle,
  Bot,
  RotateCcw,
} from 'lucide-react';

const MyComplaintsPage = () => {
  const { complaints } = useComplaints();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

  // Open create complaint modal if redirected with ?create=true or navigation state
  useEffect(() => {
    if (searchParams.get('create') === 'true' || location.state?.openCreateModal) {
      setIsCreateModalOpen(true);
      // Clean query parameter from URL
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, location, setSearchParams]);

  // Filter complaints filed by this student strictly
  const studentComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // If user is authenticated, match against student email or student ID
      if (user) {
        return (
          c.student?.email?.toLowerCase() === user.email?.toLowerCase() ||
          c.student?.id === user.id ||
          c.student?.rollNo === user.rollNo
        );
      }
      return !c.student;
    });
  }, [complaints, user]);

  // Apply search & filter criteria
  const filteredComplaints = useMemo(() => {
    return studentComplaints
      .filter((c) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = c.title?.toLowerCase().includes(q);
          const matchDesc = c.description?.toLowerCase().includes(q);
          const matchId = (c.id || c.ticketId)?.toLowerCase().includes(q);
          const matchLoc = c.location?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchId && !matchLoc) return false;
        }

        // Category filter
        if (categoryFilter !== 'ALL' && c.category !== categoryFilter) {
          return false;
        }

        // Status filter
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
  }, [studentComplaints, searchQuery, categoryFilter, statusFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Complaints
          </h1>
          <p className="text-xs text-slate-500">
            Track reported issues, monitor staff inspection updates, and verify resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/student/ai-assistant"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-50 to-accent-50 text-brand-700 hover:from-brand-100 hover:to-accent-100 border border-brand-200 text-xs font-bold transition-all shadow-xs"
          >
            <Bot className="w-4 h-4 text-brand-600" />
            <span>AI Assistant</span>
          </Link>

          {/* Prominent Create Complaint Button opening Modal */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Complaint</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, room..."
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
              <option value="ALL">All Categories ({studentComplaints.length})</option>
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
              <option value="Assigned">Assigned (Blue)</option>
              <option value="In Progress">In Progress (Purple)</option>
              <option value="Resolved">Resolved (Green)</option>
              <option value="Verified">Verified (Dark Green)</option>
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

            {(searchQuery || categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick status pills count bar */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Quick Filters:</span>
          {['ALL', 'Pending Review', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Verified', 'Rejected'].map((st) => {
            const count =
              st === 'ALL'
                ? studentComplaints.length
                : studentComplaints.filter((c) => c.status === st).length;
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

      {/* Results View */}
      {filteredComplaints.length === 0 ? (
        <EmptyState
          title="No complaints match your filter"
          description="Try adjusting your search query, clearing status filters, or create a new issue."
          actionText="Create Complaint"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <ComplaintTable complaints={filteredComplaints} role="student" />
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredComplaints.map((c) => (
              <ComplaintCard key={c.id || c.ticketId} complaint={c} role="student" />
            ))}
          </div>
        </>
      )}

      {/* Complaint Creation Modal */}
      <CreateComplaintModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          handleResetFilters();
        }}
      />
    </div>
  );
};

export default MyComplaintsPage;

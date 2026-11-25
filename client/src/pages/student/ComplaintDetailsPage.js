import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import { ComplaintTimeline, RemarksTimeline } from '../../components/common/Timeline';
import FeedbackModal from '../../components/complaints/FeedbackModal';
import RemarkModal from '../../components/complaints/RemarkModal';
import AssignModal from '../../components/complaints/AssignModal';
import EmptyState from '../../components/common/EmptyState';
import {
  MapPin,
  ShieldCheck,
  Star,
  MessageSquare,
  ArrowLeft,
  Bot,
  Maximize2,
  Play,
  UserCheck,
} from 'lucide-react';
import { isAssignedToStaff, isOwnedByStudent } from '../../utils/complaintAccess';

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { complaints, startWork } = useComplaints();
  const { currentRole, user } = useAuth();

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);

  const matchingComplaint = complaints.find((c) => c.id === id);
  const canViewComplaint =
    currentRole === 'admin' ||
    (currentRole === 'staff' && isAssignedToStaff(matchingComplaint, user)) ||
    (currentRole === 'student' && isOwnedByStudent(matchingComplaint, user));
  const complaint = canViewComplaint ? matchingComplaint : null;

  if (!complaint) {
    return (
      <EmptyState
        title="Complaint ticket not found"
        description={`No complaint was found with reference ID #${id}. It may have been archived or removed.`}
        actionText="Back to Complaints"
        onAction={() => navigate(-1)}
      />
    );
  }

  const isResolved = complaint.status === 'Resolved';
  const isVerified = complaint.status === 'Verified';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-400">
            Ticket Ref: #{complaint.id}
          </span>
          <StatusBadge status={complaint.status} size="md" />
        </div>
      </div>

      {/* Main Grid: Left Details & Right Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Core Complaint Card, Image, Remarks, Feedback */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <CategoryBadge
                category={complaint.category}
                isAiDetected={complaint.isAiDetected}
                size="md"
              />
              <span className="text-xs text-slate-400 font-medium">
                Filed on {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {complaint.title}
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                {complaint.description}
              </p>
            </div>

            {/* Location & Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-brand-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Campus Location
                  </span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                    {complaint.location}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Classification
                  </span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                    {complaint.isAiDetected ? 'AI Auto-Detected' : 'Standard Manual'}
                  </span>
                </div>
              </div>
            </div>

            {/* Uploaded Image Preview */}
            {complaint.imageUrl && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Uploaded Complaint Image
                </span>
                <div
                  onClick={() => setImageLightboxOpen(true)}
                  className="relative rounded-2xl overflow-hidden border border-slate-200/80 group cursor-pointer max-h-72"
                >
                  <img
                    src={complaint.imageUrl}
                    alt={complaint.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Maximize2 className="w-4 h-4" />
                    <span>Click to expand</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Feedback & Verification Section (Prominent when Resolved) */}
          {isResolved && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl p-6 border-2 border-emerald-300 shadow-soft space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Resolution Verification Required
                  </h3>
                  <p className="text-xs text-slate-600">
                    Are you satisfied with the resolution?
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-200">
                Staff has completed maintenance on this issue. Please test the equipment/premises and verify whether it is fixed properly.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all hover:scale-105"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Resolution</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition-colors"
                >
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Give Feedback</span>
                </button>
              </div>
            </div>
          )}

          {/* Verified Review Badge if already Verified */}
          {isVerified && complaint.feedback && (
            <div className="bg-teal-50/70 rounded-3xl p-6 border border-teal-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                  <span className="font-bold text-sm text-teal-900">
                    Resolution Verified by Student
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(complaint.feedback.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              {complaint.feedback.comment && (
                <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-teal-100">
                  "{complaint.feedback.comment}"
                </p>
              )}
              <span className="text-[10px] text-slate-400 block text-right">
                Verified on {new Date(complaint.feedback.verifiedAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Staff Remarks Timeline Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Staff Remarks & Updates
                </h3>
                <p className="text-xs text-slate-500">
                  Inspection notes and parts replacement logs
                </p>
              </div>

              {(currentRole === 'staff' || currentRole === 'admin') && (
                <button
                  type="button"
                  onClick={() => setRemarkModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Add Remark</span>
                </button>
              )}
            </div>

            <RemarksTimeline remarks={complaint.remarks} />
          </div>
        </div>

        {/* Right 5 Columns: Status Stepper Timeline & People Involved */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vertical 5-Stage Complaint Timeline */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                Complaint Lifecycle Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Live status tracking from report to resolution
              </p>
            </div>

            <ComplaintTimeline
              currentStatus={complaint.status}
              timelineData={complaint.timeline}
              orientation="vertical"
            />
          </div>

          {/* Assigned Staff Member Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Assigned Technician
              </span>
              {currentRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(true)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  {complaint.assignedStaff ? 'Reassign' : 'Assign Staff'}
                </button>
              )}
            </div>

            {complaint.assignedStaff ? (
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={complaint.assignedStaff.avatar}
                  alt={complaint.assignedStaff.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate">
                    {complaint.assignedStaff.name}
                  </h4>
                  <p className="text-xs text-brand-600 font-medium truncate">
                    {complaint.assignedStaff.department} Department
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {complaint.assignedStaff.phone}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-center space-y-2">
                <p className="text-xs text-amber-800 font-semibold">
                  Awaiting staff dispatch from administration.
                </p>
                {currentRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assign Now</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Student Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Reported By Student
            </span>
            <div className="flex items-center gap-3">
              <img
                src={complaint.student?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                alt={complaint.student?.name}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-slate-900">
                  {complaint.student?.name || 'Student'}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {complaint.student?.email}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {complaint.student?.rollNo} • {complaint.student?.department}
                </p>
              </div>
            </div>
          </div>

          {/* Staff Quick Action Bar (if staff viewing) */}
          {currentRole === 'staff' && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Staff Quick Actions
              </h4>
              <div className="space-y-2">
                {complaint.status === 'Assigned' && (
                  <button
                    type="button"
                    onClick={() => startWork(complaint.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Commence On-Site Work</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setRemarkModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Post Remark / Mark Resolved</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        complaint={complaint}
      />

      <RemarkModal
        isOpen={remarkModalOpen}
        onClose={() => setRemarkModalOpen(false)}
        complaint={complaint}
      />

      <AssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        complaint={complaint}
      />

      {/* Full image preview lightbox */}
      {imageLightboxOpen && complaint.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setImageLightboxOpen(false)}
        >
          <img
            src={complaint.imageUrl}
            alt="Expanded view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ComplaintDetailsPage;

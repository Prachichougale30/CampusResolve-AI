import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquarePlus, CheckCircle2 } from 'lucide-react';

const RemarkModal = ({ isOpen, onClose, complaint }) => {
  const { addRemark, markResolved, startWork } = useComplaints();
  const { user } = useAuth();
  const [remarkText, setRemarkText] = useState('');
  const [actionOption, setActionOption] = useState('remark_only'); // 'remark_only' | 'start_work' | 'mark_resolved'

  if (!complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!remarkText.trim()) return;

    const authorName = user?.name || 'Staff Technician';

    if (actionOption === 'mark_resolved') {
      markResolved(complaint.id, remarkText);
    } else if (actionOption === 'start_work') {
      startWork(complaint.id);
      addRemark(complaint.id, remarkText, authorName, 'Staff');
    } else {
      addRemark(complaint.id, remarkText, authorName, 'Staff');
    }

    setRemarkText('');
    setActionOption('remark_only');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Staff Remark & Status Update: #${complaint.id}`}
      subtitle="Log physical inspection notes, parts requisition, or resolution confirmation"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Progress Update / Observation Remarks
          </label>
          <textarea
            rows={4}
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="e.g. Inspected circuit panel. Capacitor damaged and needs replacement. Parts requisitioned from central stores."
            required
            className="w-full rounded-xl border-slate-200 text-xs focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Update Complaint Lifecycle Status
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="actionOption"
                value="remark_only"
                checked={actionOption === 'remark_only'}
                onChange={() => setActionOption('remark_only')}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span className="font-semibold text-slate-800">Keep current status ({complaint.status})</span>
              <span className="text-slate-400 text-[11px]">— just add progress note</span>
            </label>

            {complaint.status === 'Assigned' && (
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="actionOption"
                  value="start_work"
                  checked={actionOption === 'start_work'}
                  onChange={() => setActionOption('start_work')}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <span className="font-semibold text-slate-800">Change Status to "In Progress"</span>
                <span className="text-purple-600 text-[11px] font-bold">(Staff on site)</span>
              </label>
            )}

            {complaint.status !== 'Resolved' && complaint.status !== 'Verified' && (
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer">
                <input
                  type="radio"
                  name="actionOption"
                  value="mark_resolved"
                  checked={actionOption === 'mark_resolved'}
                  onChange={() => setActionOption('mark_resolved')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-emerald-800">Mark as "Resolved"</span>
                <span className="text-emerald-700 text-[11px]">— task is complete</span>
              </label>
            )}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!remarkText.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
          >
            {actionOption === 'mark_resolved' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <MessageSquarePlus className="w-4 h-4" />
            )}
            <span>Submit Update</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RemarkModal;

import React from 'react';
import CategoryBadge from '../common/CategoryBadge';
import { Bot, MapPin, Edit3, Send } from 'lucide-react';

const ComplaintSummaryCard = ({
  summary,
  onEdit,
  onSubmit,
  isSubmitting = false,
}) => {
  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white rounded-2xl p-5 border-2 border-brand-200 shadow-soft animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AI Generated Complaint Summary
            </h4>
            <p className="text-[11px] text-slate-500">
              CampusResolve AI parsed your issue details
            </p>
          </div>
        </div>

        <CategoryBadge
          category={summary.category}
          isAiDetected={true}
          size="sm"
        />
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">
            Complaint Title
          </span>
          <p className="font-bold text-slate-900 text-sm mt-0.5">
            {summary.title}
          </p>
        </div>

        <div>
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">
            Description
          </span>
          <p className="text-slate-700 leading-relaxed mt-0.5 bg-white/80 p-2.5 rounded-xl border border-indigo-100/60">
            {summary.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">
              Campus Location
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>{summary.location}</span>
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">
              Detected Department
            </span>
            <span className="font-semibold text-brand-700 mt-0.5 block">
              {summary.category} Team
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: [ Edit Details ] [ Submit Complaint ] */}
      <div className="mt-5 pt-4 border-t border-indigo-100 flex items-center justify-end gap-2.5">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Details</span>
          </button>
        )}

        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Complaint'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ComplaintSummaryCard;

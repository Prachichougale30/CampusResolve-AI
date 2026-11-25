import React from 'react';
import { Check, Clock, UserCheck, PlayCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

const STAGES = [
  { id: 'Pending Review', label: 'Admin Review', icon: Clock, desc: 'Waiting for administrator review' },
  { id: 'Pending', label: 'Approved', icon: ShieldCheck, desc: 'Approved and awaiting staff assignment' },
  { id: 'Assigned', label: 'Assigned', icon: UserCheck, desc: 'Assigned to staff' },
  { id: 'In Progress', label: 'In Progress', icon: PlayCircle, desc: 'Work underway' },
  { id: 'Resolved', label: 'Resolved', icon: CheckCircle2, desc: 'Issue resolved' },
  { id: 'Verified', label: 'Verified', icon: ShieldCheck, desc: 'Resolution verified' },
];

const STAGE_ORDER = {
  'Pending Review': 0,
  'Rejected': 0,
  'Pending': 1,
  'Assigned': 2,
  'In Progress': 3,
  'Resolved': 4,
  'Verified': 5,
};

export const ComplaintTimeline = ({ currentStatus, timelineData = [], orientation = 'vertical' }) => {
  const currentLevel = STAGE_ORDER[currentStatus] ?? 0;

  if (orientation === 'horizontal') {
    return (
      <div className="w-full py-4">
        <div className="relative flex items-center justify-between">
          {/* Background track */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0" />
          
          {/* Active progress fill */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-600 to-accent-600 rounded-full transition-all duration-500 z-0"
            style={{ width: `${(currentLevel / 5) * 100}%` }}
          />

          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentLevel || (idx === currentLevel && currentStatus === 'Verified');
            const isCurrent = idx === currentLevel && currentStatus !== 'Verified';
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold text-center whitespace-nowrap ${
                    isCurrent
                      ? 'text-brand-700'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical Detailed Timeline
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentLevel || (idx === currentLevel && currentStatus === 'Verified');
          const isCurrent = idx === currentLevel && currentStatus !== 'Verified';
          const Icon = stage.icon;
          const matchingTimelineEntry = timelineData.find((t) => t.stage === stage.id);
          const isLast = idx === STAGES.length - 1;

          return (
            <li key={stage.id} className="relative pb-8">
              {!isLast && (
                <span
                  className={`absolute top-5 left-5 -ml-px h-full w-0.5 transition-all duration-300 ${
                    idx < currentLevel ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              <div className="relative flex items-start space-x-3.5">
                {/* Node icon */}
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 ring-offset-1'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                {/* Content info */}
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-bold ${
                        isCurrent
                          ? 'text-brand-700'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                      {isCurrent && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                          Current Stage
                        </span>
                      )}
                    </h4>

                    {matchingTimelineEntry?.timestamp && (
                      <time className="text-xs text-slate-400 font-medium">
                        {new Date(matchingTimelineEntry.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </time>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {matchingTimelineEntry?.note || stage.desc}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const RemarksTimeline = ({ remarks = [] }) => {
  if (!remarks || remarks.length === 0) {
    return (
      <div className="py-6 text-center text-slate-400 text-xs italic">
        No staff remarks recorded yet. Updates from the technician will appear here in chronological order.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {remarks.map((remark, index) => (
        <div
          key={remark.id || index}
          className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs shadow-sm hover:bg-slate-50/80 transition-colors"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{remark.author}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-100 text-brand-700">
                {remark.authorRole || 'Staff'}
              </span>
            </div>
            <time className="text-slate-400 text-[11px]">
              {new Date(remark.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>
          <p className="text-slate-700 leading-relaxed font-normal">
            {remark.text}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ComplaintTimeline;

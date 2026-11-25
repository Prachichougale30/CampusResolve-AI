import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { FileSpreadsheet, Printer, ShieldCheck, Clock } from 'lucide-react';

const ReportsPage = () => {
  const { complaints } = useComplaints();
  const [selectedReportType, setSelectedReportType] = useState('monthly_sla');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Compliance & SLA Reports
          </h1>
          <p className="text-xs text-slate-500">
            Generate printable operational audits, turnaround SLA metrics, and campus resource logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Types Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: 'monthly_sla',
            title: 'Monthly SLA Compliance',
            desc: 'Tracks turnaround adherence under 24-hour targets across departments.',
            icon: Clock,
          },
          {
            id: 'dept_audit',
            title: 'Department Efficiency Audit',
            desc: 'Technician load balancing, resolution ratios, and parts replacement notes.',
            icon: FileSpreadsheet,
          },
          {
            id: 'student_satisfaction',
            title: 'Student Satisfaction & Rating Index',
            desc: '5-star verification ratings, resolved ticket comments, and feedback logs.',
            icon: ShieldCheck,
          },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedReportType === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedReportType(item.id)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200 shadow-soft'
                  : 'border-slate-200 hover:bg-slate-50/50 bg-white'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Report Preview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
              Official Campus Audit Preview
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              CampusResolve AI - Executive Incident Summary
            </h2>
            <p className="text-xs text-slate-400">
              Apex Institute of Technology • Reporting Period: Current Academic Term
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            SLA Compliant (98.4%)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
          <div>
            <span className="text-xs text-slate-500 font-medium">Audited Complaints</span>
            <p className="text-xl font-black text-slate-900 mt-1">{complaints.length}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Successfully Resolved</span>
            <p className="text-xl font-black text-emerald-600 mt-1">
              {complaints.filter((c) => c.status === 'Resolved' || c.status === 'Verified').length}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Avg Resolution Time</span>
            <p className="text-xl font-black text-brand-600 mt-1">3.8 Hours</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Satisfaction Score</span>
            <p className="text-xl font-black text-amber-500 mt-1">4.8 / 5.0 ⭐</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          This report aggregates all campus maintenance requests handled by CampusResolve AI. AI categorization eliminated an estimated 42 hours of manual sorting delay, allowing work orders to be assigned directly to departmental technicians within 15 minutes of submission.
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;

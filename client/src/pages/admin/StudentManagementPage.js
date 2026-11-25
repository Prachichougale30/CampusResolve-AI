import React, { useState } from 'react';
import { MOCK_STUDENTS } from '../../data/mockData';
import { useComplaints } from '../../context/ComplaintContext';
import { Search } from 'lucide-react';

const StudentManagementPage = () => {
  const { complaints } = useComplaints();
  const [searchQuery, setSearchQuery] = useState('');

  const studentsWithStats = MOCK_STUDENTS.map((student) => {
    const studentTickets = complaints.filter(
      (c) => c.student?.email === student.email || c.student?.id === student.id
    );
    const resolved = studentTickets.filter((c) => c.status === 'Resolved' || c.status === 'Verified').length;
    return {
      ...student,
      totalTickets: studentTickets.length,
      resolvedTickets: resolved,
    };
  });

  const filteredStudents = studentsWithStats.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Student Directory & Accounts
        </h1>
        <p className="text-xs text-slate-500">
          Enrolled student accounts, hostel allocations, and total issues submitted.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name, roll no, department..."
            className="w-full pl-10 rounded-xl border-slate-200 text-xs py-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-3xl border border-slate-200/80 shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Student Name & Roll No</th>
                <th className="px-6 py-4">Department & Year</th>
                <th className="px-6 py-4">Hostel / Residence</th>
                <th className="px-6 py-4 text-center">Complaints Filed</th>
                <th className="px-6 py-4 text-center">Resolved</th>
                <th className="px-6 py-4 text-center">Account Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={stu.avatar}
                        alt={stu.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                          {stu.name}
                        </span>
                        <span className="text-[11px] text-brand-600 font-mono block">
                          {stu.rollNo} • {stu.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{stu.department}</span>
                    <span className="text-[11px] text-slate-400 block">{stu.year}</span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {stu.hostel}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="font-bold text-slate-900 px-2 py-1 rounded-md bg-slate-100">
                      {stu.totalTickets}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="font-bold text-emerald-700 px-2 py-1 rounded-md bg-emerald-50">
                      {stu.resolvedTickets}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentManagementPage;

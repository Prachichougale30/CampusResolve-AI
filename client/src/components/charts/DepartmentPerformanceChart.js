import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const DEFAULT_DEPT_PERF = [
  { dept: 'Electrical', active: 4, resolved: 48 },
  { dept: 'Plumbing', active: 2, resolved: 52 },
  { dept: 'WiFi / Net', active: 5, resolved: 64 },
  { dept: 'Cleanliness', active: 1, resolved: 71 },
  { dept: 'Infrastr.', active: 3, resolved: 39 },
  { dept: 'Hostel', active: 2, resolved: 55 },
  { dept: 'Classroom', active: 2, resolved: 30 },
  { dept: 'Security', active: 1, resolved: 41 },
];

const DepartmentPerformanceChart = ({ data = DEFAULT_DEPT_PERF }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="dept" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-[11px] text-slate-600 font-semibold">{value}</span>}
          />
          <Bar dataKey="active" name="Active Tickets" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="resolved" name="Resolved Tickets" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepartmentPerformanceChart;

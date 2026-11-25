import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const STATUS_COLORS = {
  'Pending Review': '#fbbf24',
  'Rejected': '#e11d48',
  'Pending': '#f59e0b',
  'Assigned': '#3b82f6',
  'In Progress': '#8b5cf6',
  'Resolved': '#10b981',
  'Verified': '#059669',
};

const StatusDonutChart = ({ statusCounts = {} }) => {
  const data = [
    { name: 'Pending Review', value: statusCounts['Pending Review'] || 0 },
    { name: 'Rejected', value: statusCounts.Rejected || 0 },
    { name: 'Pending', value: statusCounts['Pending'] || 0 },
    { name: 'Assigned', value: statusCounts['Assigned'] || 0 },
    { name: 'In Progress', value: statusCounts['In Progress'] || 0 },
    { name: 'Resolved', value: statusCounts['Resolved'] || 0 },
    { name: 'Verified', value: statusCounts['Verified'] || 0 },
  ].filter((item) => item.value > 0);

  const total = Object.values(statusCounts).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: 'none',
                color: '#ffffff',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900">{total}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full pt-2 text-xs">
        {Object.entries(STATUS_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-slate-600 font-medium truncate">{name}</span>
            <span className="text-slate-900 font-bold ml-auto">{statusCounts[name] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDonutChart;

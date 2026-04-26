"use client";

import React from "react";

// --- Revenue Line Chart (Custom SVG) ---
export function RevenueChart({ data }: { data: { date: string, value: number }[] }) {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-main-text/40">Нет данных</div>;

  const maxVal = Math.max(...data.map(d => d.value), 100);
  const width = 400;
  const height = 200;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((d.value / maxVal) * (height - padding * 2) + padding);
    return `${x},${y}`;
  }).join(" ");

  const areaPath = `M ${padding},${height} L ${points} L ${width - padding},${height} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />

        {/* Dots */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
          const y = height - ((d.value / maxVal) * (height - padding * 2) + padding);
          return (
            <circle key={i} cx={x} cy={y} r="4" className="fill-main-bg stroke-blue-500" strokeWidth="2" />
          );
        })}

        {/* Labels */}
        <g className="text-[10px] fill-main-text/40 font-medium">
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            return (
              <text key={i} x={x} y={height + 15} textAnchor="middle">{d.date.split(",")[0]}</text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// --- Donut Chart for Service Distribution ---
export function DonutChart({ data }: { data: { name: string, count: number, revenue: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  let currentAngle = 0;
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {data.map((d, i) => {
            const percentage = (d.revenue / total) * 100;
            const dashArray = `${percentage} ${100 - percentage}`;
            const dashOffset = -currentAngle;
            currentAngle += percentage;

            return (
              <circle
                key={i}
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth="12"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                pathLength="100"
                className="transition-all duration-1000"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-[10px] text-main-text/40 uppercase font-bold tracking-widest">Всего</span>
          <span className="text-xl font-bold text-main-text tracking-tighter">
            {total.toLocaleString()} ₸
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 w-full">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
              <span className="text-sm font-medium text-main-text/80 group-hover:text-main-text transition-colors">{d.name}</span>
            </div>
            <span className="text-sm font-bold text-main-text">{Math.round((d.revenue / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Staff Leaderboard ---
export function StaffLeaderboard({ data }: { data: { name: string, bookings: number, revenue: number }[] }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="space-y-6">
      {data.map((staff, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-bold text-main-text">{staff.name}</p>
              <p className="text-[10px] text-main-text/40 font-medium uppercase tracking-wider">{staff.bookings} записей</p>
            </div>
            <p className="text-sm font-black text-main-text">{staff.revenue.toLocaleString()} ₸</p>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              style={{ width: `${(staff.revenue / maxRevenue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

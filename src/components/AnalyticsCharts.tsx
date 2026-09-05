'use client';

import { useState, useMemo } from 'react';
import type { Category, TicketStatus, Priority } from '../types';
import { Button } from '@heroui/react';
import { TrendingUp, BarChart2, PieChart, Calendar, Layers, Activity } from 'lucide-react';

interface AnalyticsChartsProps {
  ticketsOverTime: { date: string; count: number }[];
  byCategory: { category: Category; count: number }[];
  byStatus: { status: TicketStatus; count: number }[];
  byPriority: { priority: Priority; count: number }[];
}

const CATEGORY_COLORS: Record<Category, string> = {
  bug: '#ef4444',
  feature: '#3b82f6',
  question: '#8b5cf6',
  uncategorized: '#94a3b8',
  other: '#0ea5e9',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#64748b',
};

export function AnalyticsCharts({
  ticketsOverTime,
  byCategory,
  byStatus,
  byPriority,
}: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const [chartMode, setChartMode] = useState<'area' | 'bar'>('area');
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    label: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Generate continuous timeline data for selected range
  const timelineData = useMemo(() => {
    const result: { date: string; label: string; count: number }[] = [];
    const countMap = new Map<string, number>();

    ticketsOverTime.forEach((item) => {
      try {
        const d = new Date(item.date).toISOString().split('T')[0];
        countMap.set(d, Number(item.count) || 0);
      } catch {
        // Skip invalid date
      }
    });

    const now = new Date();
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      const label = `${monthName} ${dayNum}`;
      result.push({
        date: dateKey,
        label,
        count: countMap.get(dateKey) ?? 0,
      });
    }
    return result;
  }, [ticketsOverTime, timeRange]);

  const totalInPeriod = useMemo(
    () => timelineData.reduce((acc, curr) => acc + curr.count, 0),
    [timelineData]
  );

  const peakInflow = useMemo(
    () => Math.max(...timelineData.map((d) => d.count), 0),
    [timelineData]
  );

  const avgDaily = useMemo(
    () => (totalInPeriod / (timelineData.length || 1)).toFixed(1),
    [totalInPeriod, timelineData]
  );

  // SVG dimensions for Trend Chart
  const svgWidth = 650;
  const svgHeight = 220;
  const padLeft = 35;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 32;

  const innerWidth = svgWidth - padLeft - padRight;
  const innerHeight = svgHeight - padTop - padBottom;

  const maxVal = Math.max(peakInflow, 4);

  // Calculate points
  const points = useMemo(() => {
    return timelineData.map((d, index) => {
      const x = padLeft + (index / (timelineData.length - 1 || 1)) * innerWidth;
      const y = padTop + innerHeight - (d.count / maxVal) * innerHeight;
      return { ...d, x, y };
    });
  }, [timelineData, innerWidth, innerHeight, maxVal]);

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const startX = points[0].x;
    const endX = points[points.length - 1].x;
    const baseY = padTop + innerHeight;
    return `${linePath} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
  }, [linePath, points, padTop, innerHeight]);

  // Donut chart calculations for Category
  const totalCategorized = useMemo(
    () => byCategory.reduce((acc, curr) => acc + curr.count, 0) || 1,
    [byCategory]
  );

  const donutRadius = 45;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const donutSlices = useMemo(() => {
    let accumulatedOffset = 0;
    return byCategory.map((item) => {
      const fraction = item.count / totalCategorized;
      const sliceLength = fraction * donutCircumference;
      const offset = accumulatedOffset;
      accumulatedOffset += sliceLength;
      return {
        category: item.category,
        count: item.count,
        percentage: Math.round(fraction * 100),
        color: CATEGORY_COLORS[item.category] ?? '#94a3b8',
        strokeDasharray: `${sliceLength} ${donutCircumference - sliceLength}`,
        strokeDashoffset: -offset,
      };
    });
  }, [byCategory, totalCategorized, donutCircumference]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Ticket Volume Trend Chart (takes 2 cols on lg) */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                  Ticket Inflow Trend
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily incoming support request volume and activity patterns
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Range Selector */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => setTimeRange(7)}
                  className={`px-2 py-1 rounded-md transition-all ${
                    timeRange === 7
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  7D
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange(14)}
                  className={`px-2 py-1 rounded-md transition-all ${
                    timeRange === 14
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  14D
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange(30)}
                  className={`px-2 py-1 rounded-md transition-all ${
                    timeRange === 30
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  30D
                </button>
              </div>

              {/* Chart Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => setChartMode('area')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                    chartMode === 'area'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                  aria-label="Area View"
                >
                  <TrendingUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('bar')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                    chartMode === 'bar'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                  aria-label="Bar View"
                >
                  <BarChart2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Metric Summary Bar */}
          <div className="grid grid-cols-3 gap-3 mb-6 p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium block">
                Period Inflow
              </span>
              <span className="font-semibold text-slate-900 text-sm">{totalInPeriod}</span>
              <span className="text-[11px] text-slate-400 ml-1">tickets</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium block">
                Daily Avg
              </span>
              <span className="font-semibold text-slate-900 text-sm">{avgDaily}</span>
              <span className="text-[11px] text-slate-400 ml-1">/ day</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium block">
                Peak Day
              </span>
              <span className="font-semibold text-slate-900 text-sm">{peakInflow}</span>
              <span className="text-[11px] text-slate-400 ml-1">highest</span>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="relative w-full overflow-hidden select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y Axis Labels */}
              {[0, 0.5, 1].map((fraction) => {
                const y = padTop + innerHeight - fraction * innerHeight;
                const valueLabel = Math.round(fraction * maxVal);
                return (
                  <g key={fraction}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray={fraction === 0 ? 'none' : '3 3'}
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      className="font-mono font-medium"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Chart Mode Rendering */}
              {chartMode === 'area' ? (
                <>
                  {/* Area Fill */}
                  <path d={areaPath} fill="url(#areaGradient)" />

                  {/* Line Stroke */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {points.map((p, idx) => {
                    const isHovered = hoveredPoint?.date === p.date;
                    return (
                      <g key={p.date}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 5.5 : 3.5}
                          fill={isHovered ? '#4f46e5' : '#ffffff'}
                          stroke="#4f46e5"
                          strokeWidth="2"
                          className="transition-all duration-150 cursor-pointer"
                        />
                        {/* Invisible larger hover zone */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={14}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(p)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    );
                  })}
                </>
              ) : (
                /* Bar Mode */
                <g>
                  {points.map((p, idx) => {
                    const barWidth = Math.max(innerWidth / points.length - 4, 6);
                    const barHeight = (p.count / maxVal) * innerHeight;
                    const barX = p.x - barWidth / 2;
                    const barY = padTop + innerHeight - barHeight;
                    const isHovered = hoveredPoint?.date === p.date;

                    return (
                      <g key={p.date}>
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={Math.max(barHeight, 2)}
                          rx="3"
                          fill={isHovered ? '#312e81' : 'url(#barGradient)'}
                          className="transition-all duration-150 cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(p)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* X Axis Date Labels */}
              {points.map((p, idx) => {
                // Show label for first, last, and evenly spaced points
                const interval = timeRange === 30 ? 6 : timeRange === 14 ? 3 : 1;
                const shouldShow = idx === 0 || idx === points.length - 1 || idx % interval === 0;
                if (!shouldShow) return null;

                return (
                  <text
                    key={p.date}
                    x={p.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94a3b8"
                    className="font-medium"
                  >
                    {p.label}
                  </text>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none z-20 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] shadow-lg border border-slate-700/50 -translate-x-1/2 -translate-y-full -mt-2 transition-all duration-75"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                }}
              >
                <span className="text-slate-400 block text-[10px] font-medium">{hoveredPoint.label}</span>
                <span className="font-semibold text-white">
                  {hoveredPoint.count} {hoveredPoint.count === 1 ? 'ticket' : 'tickets'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Real-time aggregation from database records</span>
          <span className="font-medium text-slate-600">Updated now</span>
        </div>
      </div>

      {/* 2. Category Share Donut Chart (takes 1 col on lg) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                Category Share
              </h3>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {totalCategorized} Total
            </span>
          </div>

          {/* Donut Graphic */}
          <div className="flex justify-center my-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={donutRadius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="14"
                />

                {/* Slices */}
                {donutSlices.map((slice) => (
                  <circle
                    key={slice.category}
                    cx="60"
                    cy="60"
                    r={donutRadius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="14"
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-300"
                  />
                ))}
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  {totalCategorized}
                </span>
                <span className="text-[10px] text-slate-400 font-medium -mt-0.5">Tickets</span>
              </div>
            </div>
          </div>

          {/* Breakdown Legend */}
          <div className="space-y-2 mt-4">
            {donutSlices.map((slice) => (
              <div
                key={slice.category}
                className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="capitalize font-medium text-slate-700 truncate">
                    {slice.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono">
                  <span className="text-slate-800 font-semibold">{slice.count}</span>
                  <span className="text-[11px] text-slate-400 w-8 text-right">
                    {slice.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Proportional triage distribution</span>
        </div>
      </div>
    </div>
  );
}

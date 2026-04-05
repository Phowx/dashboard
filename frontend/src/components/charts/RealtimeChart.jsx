import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function RealtimeChart({ data }) {
  return (
    <div className="glass-card chart-panel h-full flex flex-col p-3.5 sm:p-4 xl:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="status-pill chart-tag">LOAD</span>
        <div className="flex flex-wrap gap-2">
          <span className="status-pill">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent-cyan)' }} />
            CPU
          </span>
          <span className="status-pill">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent-yellow)' }} />
            Memory
          </span>
        </div>
      </div>

      <div className="chart-frame min-h-[180px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 2 }}>
            <defs>
              <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="memoryFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-yellow)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--accent-yellow)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 9" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              minTickGap={42}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={40}
              tickFormatter={value => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--tooltip-bg)',
                border: '1px solid var(--border-strong)',
                borderRadius: '18px',
                fontSize: '11px',
                boxShadow: 'var(--shadow-panel)',
              }}
              labelStyle={{ color: 'var(--text-primary)' }}
              formatter={value => [`${value}%`]}
            />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="var(--accent-cyan)"
              fill="url(#cpuFill)"
              strokeWidth={2.5}
              name="CPU"
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="memory"
              stroke="var(--accent-yellow)"
              fill="url(#memoryFill)"
              strokeWidth={2.5}
              name="Memory"
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

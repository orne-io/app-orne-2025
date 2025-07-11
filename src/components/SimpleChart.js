import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

// Tooltip personnalisée factory
const makeCustomTooltip = (yLabel) => ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const dataPoint = payload[0].payload;
    const displayDate = dataPoint.fullDate || dataPoint.date || label;
    return (
      <div style={{ 
        background: 'white', 
        border: '1px solid #e0e0e0', 
        padding: '12px 16px', 
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '14px'
      }}>
        <div style={{ fontWeight: 600, color: '#383e5c', marginBottom: '4px' }}>{yLabel}:</div>
        <div style={{ fontSize: '18px', color: '#383e5c', fontWeight: 700, marginBottom: '8px' }}>
          {value.toLocaleString()}
        </div>
        <div style={{ color: '#666', fontSize: '13px', borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
          {displayDate}
        </div>
      </div>
    );
  }
  return null;
};

// Helper pour filtrer les données selon la période
const filterDataByPeriod = (data, period) => {
  if (!data.length) return [];
  const now = new Date();
  let fromDate;
  switch (period) {
    case '1d':
      fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
    case '1w':
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
    case '1m':
      fromDate = new Date(now.setMonth(now.getMonth() - 1)); break;
    case '3m':
      fromDate = new Date(now.setMonth(now.getMonth() - 3)); break;
    case '6m':
      fromDate = new Date(now.setMonth(now.getMonth() - 6)); break;
    case '1y':
      fromDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
    default:
      return data;
  }
  // On suppose que chaque point a une propriété fullDate ou date utilisable
  return data.filter(d => {
    const dateStr = d.fullDate || d.date;
    const date = new Date(dateStr);
    return date >= fromDate;
  });
};

const LiveChart = ({ data, color, dataKey, yLabel, period, setPeriod, gradientId }) => {
  // Filtrage des données selon la période
  const filteredData = useMemo(() => filterDataByPeriod(data, period), [data, period]);

  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={filteredData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#666' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#666' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={makeCustomTooltip(yLabel)} />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3} 
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: 'white', strokeWidth: 2 }}
            name={yLabel}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveChart;
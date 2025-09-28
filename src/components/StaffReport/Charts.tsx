// =============================
// File: /components/report/Charts.tsx (with custom colors)
// =============================
'use client';
import * as React from 'react';
import { Paper, Typography } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend, Sector, Cell, LabelList
} from 'recharts';
import { Publication } from '@/types/publication';

// Define a color palette
const YEAR_COLORS = ['#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ef5350'];
const TYPE_COLORS: Record<string,string> = {
  Journal: '#1976d2',
  Conference: '#9c27b0',
};
const LEVEL_COLORS: Record<string,string> = {
  National: '#ff9800',
  International: '#4caf50',
};

export function PublicationsByYear({ data }: { data: Publication[] }) {
  const years = Array.from(new Set(data.map(d => d.year))).sort();
  const chartData = years.map(y => ({ year: y, publications: data.filter(d => d.year === y).length }));

  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const maxVal = Math.max(0, ...chartData.map(d => d.publications));
  const domainMax = maxVal < 5 ? 5 : maxVal + 1;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: 360 }}>
      <Typography fontWeight={600} mb={2}>Publications by Year</Typography>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} onMouseLeave={() => setActiveIndex(undefined)}>
          <XAxis dataKey="year" />
          <YAxis allowDecimals={false} domain={[0, domainMax]} />
          <Tooltip />
          <Bar dataKey="publications" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="publications" position="top" />
            {chartData.map((_, idx) => (
              <Cell
                key={idx}
                onMouseEnter={() => setActiveIndex(idx)}
                fill={YEAR_COLORS[idx % YEAR_COLORS.length]}
                cursor="pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export function PublicationsByType({ data }: { data: Publication[] }) {
  const counts = {
    Journal: data.filter(d => d.type === 'Journal').length,
    Conference: data.filter(d => d.type === 'Conference').length,
  };
  const chartData = [
    { name: 'Journal', value: counts.Journal },
    { name: 'Conference', value: counts.Conference },
  ];

  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const renderActiveShape = (props: any) => {
    const RAD = Math.PI / 180;
    const {
      cx, cy, midAngle, innerRadius, outerRadius,
      startAngle, endAngle, fill, payload, percent, value,
    } = props;

    return (
      <g>
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central" fontWeight={700}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="central">
          {value} ({(percent * 100).toFixed(0)}%)
        </text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} innerRadius={outerRadius + 4} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.25} />
      </g>
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: 360 }}>
      <Typography fontWeight={600} mb={2}>Publications by Type</Typography>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Tooltip formatter={(v: number, n: string) => [`${v}`, n]} />
          <Legend />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            //activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, idx) => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={TYPE_COLORS[entry.name]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export function PublicationsByLevel({ data }: { data: Publication[] }) {
  const counts = {
    National: data.filter(d => d.level === 'National').length,
    International: data.filter(d => d.level === 'International').length,
  };
  const chartData = [
    { name: 'National', value: counts.National },
    { name: 'International', value: counts.International },
  ];

  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    return (
      <g>
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central" fontWeight={700}>{payload.name}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="central">{value} ({(percent * 100).toFixed(0)}%)</text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} innerRadius={outerRadius + 4} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.25} />
      </g>
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: 360 }}>
      <Typography fontWeight={600} mb={2}>Publications by Level</Typography>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Tooltip formatter={(v: number, n: string) => [`${v}`, n]} />
          <Legend />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            //activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, idx) => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={LEVEL_COLORS[entry.name]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}

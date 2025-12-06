// apps/frontend/components/Dashboard/RevenueChart.tsx
'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  // Sample data if none provided
  const chartData = data.length > 0 ? data : [
    { date: 'Jan 1', revenue: 4000, orders: 24 },
    { date: 'Jan 2', revenue: 3000, orders: 13 },
    { date: 'Jan 3', revenue: 5000, orders: 28 },
    { date: 'Jan 4', revenue: 2780, orders: 19 },
    { date: 'Jan 5', revenue: 1890, orders: 15 },
    { date: 'Jan 6', revenue: 2390, orders: 22 },
    { date: 'Jan 7', revenue: 3490, orders: 27 },
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#666" 
            fontSize={12}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'revenue' ? `$${value}` : value,
              name === 'revenue' ? 'Revenue' : 'Orders'
            ]}
            labelStyle={{ color: '#333' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
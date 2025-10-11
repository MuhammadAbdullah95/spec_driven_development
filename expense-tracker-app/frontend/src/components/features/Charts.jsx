import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import Card from '../ui/Card';

const SpendingChart = ({ data = [], className = '' }) => {
  const formatCurrency = (value) => `$${value.toFixed(0)}`;
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Spending Over Time</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-primary text-white rounded-lg">7D</button>
          <button className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">30D</button>
          <button className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">90D</button>
        </div>
      </div>
      
      <div className="h-64">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Amount']}
                labelStyle={{ color: '#1e293b' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#0EA5E9"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAmount)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                📊
              </div>
              <p>No data available</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const CategoryChart = ({ data = [], className = '' }) => {
  const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const COLORS = ['#0EA5E9', '#06B6D4', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#6366F1'];

  const formatCurrency = (value) => `$${value.toFixed(0)}`;

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Category Breakdown</h3>
      
      {data.length > 0 ? (
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="amount"
                  animationDuration={1000}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="space-y-3">
            {data.map((item, index) => {
              const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-slate-700">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">{formatCurrency(item.amount)}</p>
                    <p className="text-xs text-slate-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            🥧
          </div>
          <p className="text-slate-400">No category data available</p>
        </div>
      )}
    </Card>
  );
};

const TrendChart = ({ data = [], className = '' }) => {
  const formatCurrency = (value) => `$${value.toFixed(0)}`;

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Spending Trends</h3>
      
      <div className="h-48">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Amount']}
                labelStyle={{ color: '#1e293b' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0EA5E9"
                strokeWidth={3}
                dot={{ fill: '#0EA5E9', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#0EA5E9', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                📈
              </div>
              <p>No trend data available</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export { SpendingChart, CategoryChart, TrendChart };

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export default function EarningsChart({ projects }) {
  const getMonthlyData = () => {
    const monthlyEarnings = {};
    
    projects.forEach(project => {
      if (project.status === 'complete') {
        const date = new Date(project.created_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyEarnings[monthKey] = (monthlyEarnings[monthKey] || 0) + (project.price || 0);
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      data.push({
        month: months[date.getMonth()],
        earnings: monthlyEarnings[monthKey] || 0
      });
    }

    return data;
  };

  const data = getMonthlyData();
  const growth = data.length > 1 ? ((data[data.length - 1].earnings - data[data.length - 2].earnings) / (data[data.length - 2].earnings || 1) * 100).toFixed(1) : 0;

  return (
    <div className="rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Earnings Trend</h2>
        {growth !== 0 && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${growth > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">{growth > 0 ? '+' : ''}{growth}%</span>
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E23" opacity={0.5} />
          <XAxis 
            dataKey="month" 
            stroke="#71717A"
            style={{ fontSize: '12px', fontWeight: '500' }}
          />
          <YAxis 
            stroke="#71717A"
            style={{ fontSize: '12px', fontWeight: '500' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(20, 20, 25, 0.95)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '12px',
              color: '#fff',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
            }}
            formatter={(value) => [`₹${value}`, 'Earnings']}
          />
          <Area
            type="monotone"
            dataKey="earnings"
            stroke="#6366F1"
            strokeWidth={3}
            fill="url(#colorEarnings)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
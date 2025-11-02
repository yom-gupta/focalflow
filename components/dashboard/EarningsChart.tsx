'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { Project } from '@/lib/supabase/types'
import { useTheme } from '@/contexts/ThemeContext'

interface EarningsChartProps {
  projects: Project[]
}

export default function EarningsChart({ projects }: EarningsChartProps) {
  const getMonthlyData = () => {
    const monthlyEarnings: Record<string, number> = {}
    
    projects.forEach(project => {
      if (project.status === 'complete') {
        const date = new Date(project.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyEarnings[monthKey] = (monthlyEarnings[monthKey] || 0) + (project.price || 0)
      }
    })

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentDate = new Date()
    const data = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      data.push({
        month: months[date.getMonth()],
        earnings: monthlyEarnings[monthKey] || 0
      })
    }

    return data
  }

  const data = getMonthlyData()
  const growth = data.length > 1 
    ? ((data[data.length - 1].earnings - data[data.length - 2].earnings) / (data[data.length - 2].earnings || 1) * 100).toFixed(1)
    : 0

  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const accentColor = isDark ? '#4fc3f7' : '#6366f1'

  return (
    <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>Earnings Trend</h2>
        {Number(growth) !== 0 && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${Number(growth) > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">{Number(growth) > 0 ? '+' : ''}{growth}%</span>
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} opacity={0.5} />
          <XAxis 
            dataKey="month" 
            stroke={isDark ? '#a5a5a5' : '#787774'}
            style={{ fontSize: '12px', fontWeight: '500' }}
          />
          <YAxis 
            stroke={isDark ? '#a5a5a5' : '#787774'}
            style={{ fontSize: '12px', fontWeight: '500' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? 'rgba(31, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '12px',
              color: isDark ? '#ededed' : '#37352f',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}
            formatter={(value) => [`₹${value}`, 'Earnings']}
          />
          <Area
            type="monotone"
            dataKey="earnings"
            stroke={accentColor}
            strokeWidth={3}
            fill="url(#colorEarnings)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}


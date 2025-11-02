'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: number
}

export default function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`group relative overflow-hidden rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6 hover:border-accent transition-all duration-200`}>
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border`}>
            <Icon className={`w-5 h-5 ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <h3 className={`text-sm font-normal mb-2 ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>{title}</h3>
        <p className={`text-3xl font-semibold mb-1 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>{value}</p>
        {subtitle && <p className={`text-sm font-normal ${isDark ? 'text-[#787774]' : 'text-gray-500'}`}>{subtitle}</p>}
      </div>
    </div>
  )
}


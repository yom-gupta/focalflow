'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, Briefcase, TrendingUp, Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Layout from '@/components/layout'
import StatCard from '@/components/dashboard/StatCard'
import RecentProjects from '@/components/dashboard/RecentProjects'
import EarningsChart from '@/components/dashboard/EarningsChart'
import TimeFilter from '@/components/TimeFilter'
import { getProjects, getExpenses, getClients } from '@/lib/supabase/queries'
import { getUser } from '@/lib/auth'
import { useTheme } from '@/contexts/ThemeContext'

export default function Dashboard() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [timeFilter, setTimeFilter] = useState('all')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getUser().then((user) => {
      if (!user) {
        router.push('/')
      } else {
        setUserId(user.id)
      }
    })
  }, [router])

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => userId ? getProjects(userId) : [],
    enabled: !!userId,
  })

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', userId],
    queryFn: () => userId ? getExpenses(userId) : [],
    enabled: !!userId,
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', userId],
    queryFn: () => userId ? getClients(userId) : [],
    enabled: !!userId,
  })

  const filterByTime = (items: any[], dateField: string) => {
    if (timeFilter === 'all') return items
    
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return items.filter(item => {
      const itemDate = new Date(item[dateField])
      switch(timeFilter) {
        case 'day':
          return itemDate >= startOfDay
        case 'week':
          return itemDate >= startOfWeek
        case 'month':
          return itemDate >= startOfMonth
        default:
          return true
      }
    })
  }

  const filteredProjects = filterByTime(projects, 'created_at')
  const filteredExpenses = filterByTime(expenses, 'date')

  const stats = {
    totalIncome: filteredProjects
      .filter(p => p.status === 'complete')
      .reduce((sum, p) => sum + (p.price || 0), 0),
    totalExpenses: filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    activeProjects: filteredProjects.filter(p => p.status === 'working').length,
    totalClients: clients.length
  }

  const profit = stats.totalIncome - stats.totalExpenses
  const overallProgress = filteredProjects.length > 0
    ? (filteredProjects.filter(p => p.status === 'complete').length / filteredProjects.length) * 100
    : 0

  if (!userId) {
    return (
      <Layout>
        <div className="min-h-screen p-8 flex items-center justify-center">
          <div className="text-center">
            <div className={`w-16 h-16 border-4 ${isDark ? 'border-[#4fc3f7]' : 'border-[#6366f1]'} border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
            <p className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className={`text-3xl md:text-4xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-1 tracking-tight`}>
                Welcome back! 👋
              </h1>
              <p className={`${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} font-normal text-sm`}>Here's what's happening with your projects today.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <TimeFilter activeFilter={timeFilter} onChange={setTimeFilter} />
              <Link href="/projects">
                <Button className={`w-full sm:w-auto ${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-900 hover:bg-gray-800 text-white'} border border-border font-normal`}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>Overall Progress</h3>
              <span className={`font-bold text-lg ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`}>{overallProgress.toFixed(0)}%</span>
            </div>
            <div className={`h-3 ${isDark ? 'bg-[#1f1f1f]' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <div 
                className={`h-full ${isDark ? 'bg-[#4fc3f7]' : 'bg-[#6366f1]'} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <p className={`text-sm mt-3 font-normal ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
              {filteredProjects.filter(p => p.status === 'complete').length} of {filteredProjects.length} projects completed
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Income"
              value={`₹${stats.totalIncome.toLocaleString()}`}
              subtitle="From completed projects"
              icon={DollarSign}
              trend={12}
            />
            <StatCard
              title="Net Profit"
              value={`₹${profit.toLocaleString()}`}
              subtitle={`${stats.totalExpenses.toLocaleString()} in expenses`}
              icon={TrendingUp}
              trend={8}
            />
            <StatCard
              title="Active Projects"
              value={stats.activeProjects}
              subtitle={`${filteredProjects.length} total projects`}
              icon={Briefcase}
            />
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              subtitle="Business relationships"
              icon={Users}
            />
          </div>

          {/* Charts and Recent Projects */}
          <div className="grid lg:grid-cols-2 gap-6">
            <EarningsChart projects={filteredProjects} />
            <RecentProjects projects={filteredProjects} />
          </div>
        </div>

        {/* Floating Action Button - Mobile */}
        <Link href="/projects" className="lg:hidden">
          <button className={`fixed bottom-6 right-6 w-14 h-14 rounded-full ${isDark ? 'bg-[#2e2e2e]' : 'bg-gray-900'} border border-border shadow-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 z-50`}>
            <Plus className="w-6 h-6" />
          </button>
        </Link>
      </div>
    </Layout>
  )
}


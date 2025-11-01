import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Briefcase, TrendingUp, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatCard from "../components/dashboard/StatCard";
import RecentProjects from "../components/dashboard/RecentProjects";
import EarningsChart from "../components/dashboard/EarningsChart";
import TimeFilter from "../components/TimeFilter";

export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState('all');

  // Check authentication first
  const { data: isAuthenticated, isLoading: authLoading } = useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: () => base44.auth.isAuthenticated(),
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list("-created_date"),
    initialData: [],
    enabled: isAuthenticated === true,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list("-date"),
    initialData: [],
    enabled: isAuthenticated === true,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    initialData: [],
    enabled: isAuthenticated === true,
  });

  // Redirect to landing if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = createPageUrl("Landing");
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filterByTime = (items, dateField) => {
    if (timeFilter === 'all') return items;
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      switch(timeFilter) {
        case 'day':
          return itemDate >= startOfDay;
        case 'week':
          return itemDate >= startOfWeek;
        case 'month':
          return itemDate >= startOfMonth;
        default:
          return true;
      }
    });
  };

  const filteredProjects = filterByTime(projects, 'created_date');
  const filteredExpenses = filterByTime(expenses, 'date');

  const stats = {
    totalIncome: filteredProjects
      .filter(p => p.status === 'complete')
      .reduce((sum, p) => sum + (p.price || 0), 0),
    totalExpenses: filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    activeProjects: filteredProjects.filter(p => p.status === 'working').length,
    totalClients: clients.length
  };

  const profit = stats.totalIncome - stats.totalExpenses;
  const overallProgress = filteredProjects.length > 0
    ? (filteredProjects.filter(p => p.status === 'complete').length / filteredProjects.length) * 100
    : 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2 tracking-tight">
              Welcome back! 👋
            </h1>
            <p className="text-zinc-400 font-medium">Here's what's happening with your projects today.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <TimeFilter activeFilter={timeFilter} onChange={setTimeFilter} />
            <Link to={createPageUrl("Projects")}>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Overall Progress</h3>
            <span className="text-indigo-400 font-bold text-lg">{overallProgress.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-[#0B0B10] rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-zinc-400 mt-3 font-medium">
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
      <Link to={createPageUrl("Projects")} className="lg:hidden">
        <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/50 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 z-50">
          <Plus className="w-6 h-6" />
        </button>
      </Link>
    </div>
  );
}

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import VideoProgressTracker from "../components/projects/VideoProgressTracker";

// Helper component for Time Filter
const TimeFilter = ({ activeFilter, onChange }) => (
  <Select value={activeFilter} onValueChange={onChange}>
    <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-white/10 text-white">
      <SelectValue placeholder="Filter by time" />
    </SelectTrigger>
    <SelectContent className="bg-slate-900 border-white/10">
      <SelectItem value="all">All Time</SelectItem>
      <SelectItem value="day">Today</SelectItem>
      <SelectItem value="week">This Week</SelectItem>
      <SelectItem value="month">This Month</SelectItem>
    </SelectContent>
  </Select>
);

export default function Projects() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list("-created_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowForm(false);
      setEditingProject(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowForm(false);
      setEditingProject(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const filterByTime = (items) => {
    if (timeFilter === 'all') return items;
    
    const now = new Date();
    // Set time to 00:00:00 for accurate day comparison
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of the week (Sunday for consistency)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Adjust to Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Set time to 00:00:00
    
    // Start of the month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0); // Set time to 00:00:00

    return items.filter(item => {
      // Ensure created_date is a valid date string
      if (!item.created_date) return false; 
      const itemDate = new Date(item.created_date);

      // Check if itemDate is valid
      if (isNaN(itemDate.getTime())) return false; 

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

  const timeFilteredProjects = filterByTime(projects);

  const filteredProjects = timeFilteredProjects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: filteredProjects.length,
    working: filteredProjects.filter(p => p.status === 'working').length,
    complete: filteredProjects.filter(p => p.status === 'complete').length,
    totalEarnings: filteredProjects.filter(p => p.status === 'complete').reduce((sum, p) => sum + (p.price || 0), 0)
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Projects</h1>
            <p className="text-zinc-400 font-medium">Manage your video editing projects</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <TimeFilter activeFilter={timeFilter} onChange={setTimeFilter} />
            <Button
              onClick={() => {
                setEditingProject(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-medium shadow-lg shadow-indigo-500/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-4 shadow-lg hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
            <p className="text-zinc-400 text-sm mb-1 font-medium">Total Projects</p>
            <p className="text-2xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-4 shadow-lg hover:shadow-xl hover:shadow-blue-500/5 transition-all">
            <p className="text-zinc-400 text-sm mb-1 font-medium">Active</p>
            <p className="text-2xl font-semibold text-blue-400">{stats.working}</p>
          </div>
          <div className="rounded-xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-4 shadow-lg hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
            <p className="text-zinc-400 text-sm mb-1 font-medium">Completed</p>
            <p className="text-2xl font-semibold text-emerald-400">{stats.complete}</p>
          </div>
          <div className="rounded-xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-4 shadow-lg hover:shadow-xl hover:shadow-purple-500/5 transition-all">
            <p className="text-zinc-400 text-sm mb-1 font-medium">Total Earnings</p>
            <p className="text-2xl font-semibold text-white">₹{stats.totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects or clients..."
              className="pl-10 bg-slate-900/50 border-white/10 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="working">Working</SelectItem>
              <SelectItem value="delay">Delay</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="cancel">Cancel</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="thumbnail">Thumbnail</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} onClick={() => setSelectedProject(project)}>
              <ProjectCard project={project} onEdit={handleEdit} />
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No projects found</p>
          </div>
        )}

        {/* Project Form Modal */}
        {showForm && (
          <ProjectForm
            project={editingProject}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {/* Video Progress Modal */}
        {selectedProject && selectedProject.type === 'video' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <VideoProgressTracker project={selectedProject} />
              <Button
                onClick={() => setSelectedProject(null)}
                className="w-full mt-4 bg-slate-800/50 border border-white/10 hover:bg-slate-800"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile */}
      <button 
        onClick={() => {
          setEditingProject(null);
          setShowForm(true);
        }}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/50 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

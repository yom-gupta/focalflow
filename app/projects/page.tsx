'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, CheckCircle, Settings, PlayCircle, Clock, XCircle, HelpCircle } from 'lucide-react'
import Layout from '@/components/layout'
import ProjectCard from '@/components/projects/ProjectCard'
import ProjectForm from '@/components/projects/ProjectForm'
import { getProjects, createProject, updateProject } from '@/lib/supabase/queries'
import { getUser } from '@/lib/auth'
import type { Project } from '@/lib/supabase/types'
import TimeFilter from '@/components/TimeFilter'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function Projects() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [userId, setUserId] = useState<string | null>(null)
  const [showLegend, setShowLegend] = useState(false)

  useEffect(() => {
    getUser().then((user) => {
      if (!user) {
        router.push('/')
      } else {
        setUserId(user.id)
      }
    })
  }, [router])

  // Close legend when clicking outside
  useEffect(() => {
    if (!showLegend) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.legend-container')) {
        setShowLegend(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showLegend])

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => userId ? getProjects(userId) : [],
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowForm(false)
      setEditingProject(null)
      toast.success('Project created successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to create project', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowForm(false)
      setEditingProject(null)
      toast.success('Project updated successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to update project', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  const handleSubmit = (data: any) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filterByTime = (items: Project[]) => {
    if (timeFilter === 'all') return items
    
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return items.filter(item => {
      if (!item.created_at) return false
      const itemDate = new Date(item.created_at)
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

  const timeFilteredProjects = filterByTime(projects)

  const filteredProjects = timeFilteredProjects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesType = typeFilter === 'all' || project.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: filteredProjects.length,
    working: filteredProjects.filter(p => p.status === 'working').length,
    complete: filteredProjects.filter(p => p.status === 'complete').length,
    totalEarnings: filteredProjects.filter(p => p.status === 'complete').reduce((sum, p) => sum + (p.price || 0), 0)
  }

  if (!userId) {
    return (
      <Layout>
        <div className="min-h-screen p-8 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-[#ededed] mb-1 tracking-tight">Projects</h1>
              <p className="text-[#a5a5a5] font-normal text-sm">Manage your video editing projects</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-end">
              <div className="relative legend-container">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowLegend(!showLegend)
                  }}
                  className="text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]"
                  title="Status Legend"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
                {showLegend && (
                  <div 
                    className="absolute right-0 top-full mt-2 bg-[#2e2e2e] border border-white/[0.09] rounded-lg p-4 shadow-xl z-10 min-w-[280px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-sm font-semibold text-[#ededed] mb-3">Status Legend</h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ color: '#3B82F6' }} />
                        <span className="text-[#a5a5a5]">Complete — Project finished</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" style={{ color: '#10B981' }} />
                        <span className="text-[#a5a5a5]">In progress — Currently working</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4" style={{ color: '#64748B' }} />
                        <span className="text-[#a5a5a5]">Not started — Project not begun</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: '#F97316' }} />
                        <span className="text-[#a5a5a5]">Delayed — Behind schedule</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                        <span className="text-[#a5a5a5]">Cancelled — Project cancelled</span>
                      </div>
                      <div className="border-t border-white/[0.09] pt-2.5 mt-2.5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base font-semibold" style={{ color: '#10B981' }}>₹</span>
                          <span className="text-[#a5a5a5]">Paid — Invoice paid</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base font-semibold" style={{ color: '#9CA3AF' }}>₹</span>
                          <span className="text-[#a5a5a5]">Invoice sent — Awaiting payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold" style={{ color: '#6B7280' }}>₹</span>
                          <span className="text-[#a5a5a5]">No invoice — Not invoiced yet</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <TimeFilter activeFilter={timeFilter} onChange={setTimeFilter} />
              <Button
                onClick={() => {
                  setEditingProject(null)
                  setShowForm(true)
                }}
                className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:from-[#8B5CF6] hover:to-[#6366F1] text-white border-0 font-normal"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#2e2e2e] border border-white/[0.09] p-4">
              <p className="text-[#a5a5a5] text-xs mb-1 font-normal">Total Projects</p>
              <p className="text-2xl font-semibold text-[#ededed]">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-[#2e2e2e] border border-white/[0.09] p-4">
              <p className="text-[#a5a5a5] text-xs mb-1 font-normal">Active</p>
              <p className="text-2xl font-semibold text-[#4fc3f7]">{stats.working}</p>
            </div>
            <div className="rounded-lg bg-[#2e2e2e] border border-white/[0.09] p-4">
              <p className="text-[#a5a5a5] text-xs mb-1 font-normal">Completed</p>
              <p className="text-2xl font-semibold text-[#81c784]">{stats.complete}</p>
            </div>
            <div className="rounded-lg bg-[#2e2e2e] border border-white/[0.09] p-4">
              <p className="text-[#a5a5a5] text-xs mb-1 font-normal">Total Earnings</p>
              <p className="text-2xl font-semibold text-[#ededed]">₹{stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6e6e6e]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or clients..."
                className="pl-10 bg-[#2e2e2e] border-white/[0.09] text-[#ededed] placeholder:text-[#6e6e6e] focus:border-white/[0.15]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-[#2e2e2e] border-white/[0.09] text-[#ededed]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
              <SelectContent>
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
              <ProjectCard key={project.id} project={project} onEdit={handleEdit} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#a5a5a5]">No projects found</p>
            </div>
          )}

          {/* Project Form Modal */}
          {showForm && (
            <ProjectForm
              project={editingProject}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingProject(null)
              }}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              userId={userId}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}


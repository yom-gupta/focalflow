'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Edit, ExternalLink, Trash2, Calendar, Clock, AlertCircle, Link as LinkIcon } from 'lucide-react'
import type { Project } from '@/lib/supabase/types'
import { deleteProject } from '@/lib/supabase/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import ProgressModal from './ProgressModal'

const statusColors: Record<string, string> = {
  not_started: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  working: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delay: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  complete: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancel: 'bg-red-500/20 text-red-400 border-red-500/30'
}

const typeColors: Record<string, string> = {
  thumbnail: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  video: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  other: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
}

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
}

export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const queryClient = useQueryClient()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [showProgressModal, setShowProgressModal] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to delete project', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(project.id)
    }
  }

  const getDaysInProgress = () => {
    if (!project.start_date) return null
    const start = new Date(project.start_date)
    const now = new Date()
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getProgress = () => {
    if (project.type === 'video' && project.video_steps) {
      const steps = ['cuts', 'color_grade', 'sound_design', 'motion_graphics', 'export']
      const completed = steps.filter(step => project.video_steps?.[step as keyof typeof project.video_steps]).length
      return (completed / steps.length) * 100
    }
    if (project.type === 'thumbnail' && project.thumbnail_steps) {
      const steps = ['concept', 'design', 'review', 'final']
      const completed = steps.filter(step => project.thumbnail_steps?.[step as keyof typeof project.thumbnail_steps]).length
      return (completed / steps.length) * 100
    }
    return project.status === 'complete' ? 100 : project.status === 'working' ? 50 : 0
  }

  const daysInProgress = getDaysInProgress()
  const progress = getProgress()

  return (
    <>
      <div className={`group relative overflow-hidden rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border hover:border-accent transition-all duration-200`}>
        <div className="relative p-5 ">
          <div className="cursor-pointer "  onClick={(e) => {
          e.stopPropagation()
          setShowProgressModal(true)
        }}>

         
        <div className="flex items-start justify-between mb-4 ">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>{project.title}</h3>
              <Badge className={`${typeColors[project.type]} border text-xs`}>
                {project.type}
              </Badge>
            </div>
            <p className={`text-sm font-normal ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>{project.client_name}</p>
          </div>
          <Badge className={`${statusColors[project.status]} border`}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Progress Bar - Clickable */}
        <div className="mb-4" >
          <div className={`flex items-center justify-between text-xs ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} mb-1`}>
            <span className="cursor-pointer hover:underline">Progress (click to update)</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className={`h-1.5 ${isDark ? 'bg-[#1f1f1f]' : 'bg-gray-200'} rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity`}>
            <div 
              className={`h-full ${isDark ? 'bg-[#4fc3f7]' : 'bg-[#6366f1]'} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Price</span>
            <span className={`font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>₹{project.price?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Quantity</span>
            <span className={isDark ? 'text-[#ededed]' : 'text-[#37352f]'}>{project.quantity}</span>
          </div>
          </div>
          {project.start_date && (
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
              <Calendar className="w-4 h-4" />
              <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
            </div>
          )}
          
          {daysInProgress !== null && (
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`}>
              <Clock className="w-4 h-4" />
              <span>{daysInProgress} days in progress</span>
            </div>
          )}
          
          {project.status === 'delay' && project.delay_days && project.delay_days > 0 && (
            <div className="flex items-center gap-2 text-sm text-[#ef5350]">
              <AlertCircle className="w-4 h-4" />
              <span>Delayed by {project.delay_days} days</span>
            </div>
          )}
          
          {project.deadline && (
            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Deadline</span>
              <span className={isDark ? 'text-[#ededed]' : 'text-[#37352f]'}>{new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {project.notes && (
          <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>{project.notes}</p>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
            className={`flex-1 ${isDark ? 'bg-[#1f1f1f] border-white/[0.09] hover:bg-[#2e2e2e] hover:border-white/[0.15] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-[#37352f]'}`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {project.source_link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(project.source_link, '_blank')}
              className={isDark ? 'bg-[#1f1f1f] border-white/[0.09] hover:bg-[#2e2e2e] hover:border-white/[0.15] text-[#4fc3f7]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#6366f1]'}
              title="Source Files"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          )}
          {project.link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(project.link, '_blank')}
              className={isDark ? 'bg-[#1f1f1f] border-white/[0.09] hover:bg-[#2e2e2e] hover:border-white/[0.15] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#37352f]'}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className={isDark ? 'bg-[#1f1f1f] border-white/[0.09] hover:bg-[#2e2e2e] hover:border-[#ef5350]/30 text-[#ef5350]' : 'bg-gray-50 border-gray-200 hover:bg-red-50 hover:border-red-300 text-red-600'}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
    {showProgressModal && (
      <ProgressModal project={project} onClose={() => setShowProgressModal(false)} />
    )}
    </>
  )
}


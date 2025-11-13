'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

import { 
  Edit, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  Clock, 
  IndianRupee,
  AlertCircle, 
  Link as LinkIcon,
  CheckCircle,
  Settings,
  PlayCircle,
  XCircle,
  Film,
  Image as ImageIcon
} from 'lucide-react'
import type { Project } from '@/lib/supabase/types'
import { deleteProject } from '@/lib/supabase/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import ProgressModal from './ProgressModal'
import { projectStatusMeta, invoiceMeta, getStageLabel, getRemainingMoney, getCompletionTime } from '@/lib/utils/status'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
}

// Icon mapping for status icons
const StatusIconMap = {
  'check-circle': CheckCircle,
  'clock': Clock,
  'settings': Settings,
  'play-circle': PlayCircle,
  'x-circle': XCircle,
  'circle': Clock
}

export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const queryClient = useQueryClient()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [showProgressModal, setShowProgressModal] = useState(false)

  const status = projectStatusMeta(project)
  const invoice = invoiceMeta(project)
  const currentStage = getStageLabel(project)
  const remainingMoney = getRemainingMoney(project)
  const completionTime = getCompletionTime(project)

  const StatusIcon = StatusIconMap[status.icon as keyof typeof StatusIconMap] || Clock

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
      const steps = ['brief', 'script', 'cuts', 'color_grade', 'sound_design', 'motion_graphics', 'review', 'revison_2', 'final_export', 'deliver_files', 'send_invoice', 'get_paid', 'feedback']
      const completed = steps.filter(step => project.video_steps?.[step as keyof typeof project.video_steps]).length
      return (completed / steps.length) * 100
    }
    if (project.type === 'thumbnail' && project.thumbnail_steps) {
      const steps = ['brief', 'concept', 'design', 'review', 'revison_2', 'finalize', 'deliver_files', 'send_invoice', 'get_paid', 'feedback']
      const completed = steps.filter(step => project.thumbnail_steps?.[step as keyof typeof project.thumbnail_steps]).length
      return (completed / steps.length) * 100
    }
    return project.status === 'complete' ? 100 : project.status === 'working' ? 50 : 0
  }

  const daysInProgress = getDaysInProgress()
  const progress = getProgress()

  return (
    <>
      <div className={`group relative overflow-hidden rounded-2xl project-card ${isDark ? 'bg-[#111214] border-white/[0.09]' : 'bg-white border-gray-200'} border hover:border-accent transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}>
        <div className="relative p-6">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                {project.title}
              </h3>
              <p className={`text-sm font-normal mb-3 ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                {project.client_name}
              </p>
              
              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Type Badge */}
                <span 
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    project.type === 'video' 
                      ? 'bg-[#7C3AED] text-white' 
                      : project.type === 'thumbnail'
                      ? 'bg-[#DB2777] text-white'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {project.type === 'video' ? (
                      <Film className="w-3 h-3" />
                    ) : project.type === 'thumbnail' ? (
                      <ImageIcon className="w-3 h-3" />
                    ) : null}
                    <span className="capitalize">{project.type}</span>
                  </span>
                </span>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5">
                  <StatusIcon className="w-4 h-4" style={{ color: status.color }} />
                  <span className="text-xs font-medium" style={{ color: status.color }}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Icon */}
            <div className="flex flex-col items-end gap-1">
              <IndianRupee className="w-5 h-5" style={{ color: invoice.color }} />
              <span className="text-xs text-[#a5a5a5]" title={invoice.title}>
                {invoice.title}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div 
            className="mb-4 cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation()
              setShowProgressModal(true)
            }}
          >
            <div className={`flex items-center justify-between text-xs mb-2 ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
              <span className="hover:underline">{currentStage}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className={`h-2 ${isDark ? 'bg-[#1f1f1f]' : 'bg-gray-200'} rounded-full overflow-hidden hover:opacity-80 transition-opacity`}>
              <div 
                className={`h-full ${isDark ? 'bg-sky-500' : 'bg-[#6366f1]'} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Price</span>
              <span className={`font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                ₹{project.price?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Quantity</span>
              <span className={isDark ? 'text-[#ededed]' : 'text-[#37352f]'}>{project.quantity}</span>
            </div>
            {project.start_date && (
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                <Calendar className="w-4 h-4" />
                <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
              </div>
            )}
            {completionTime !== null && (
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#10B981]' : 'text-[#10B981]'}`}>
                <CheckCircle className="w-4 h-4" />
                <span>Completed in {completionTime} {completionTime === 1 ? 'day' : 'days'}</span>
              </div>
            )}
            {!completionTime && daysInProgress !== null && (
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
                <span className={isDark ? 'text-[#ededed]' : 'text-[#37352f]'}>
                  {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
            {project.link && (
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Project Link</span>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 ${isDark ? 'text-[#4fc3f7] hover:text-[#81c9e3]' : 'text-[#6366f1] hover:text-[#818cf8]'} transition-colors`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs truncate max-w-[120px]">
                    {(() => {
                      try {
                        return new URL(project.link!).hostname
                      } catch {
                        return project.link.length > 20 ? project.link.substring(0, 20) + '...' : project.link
                      }
                    })()}
                  </span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>

          {project.notes && (
            <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
              {project.notes}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(project)}
              className={`flex-1 rounded-xl ${isDark ? 'bg-[#1f1f1f] border-white/[0.09] hover:bg-[#2e2e2e] hover:border-white/[0.15] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-[#37352f]'}`}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            {project.link && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(project.link, '_blank')}
                className={`rounded-xl ${isDark ? 'bg-[#1f1f1f] border-white/[0.09] hover:bg-[#2e2e2e] hover:border-white/[0.15] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#37352f]'}`}
                title="Project Link"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            {project.source_link && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(project.source_link, '_blank')}
                className={`rounded-xl ${isDark ? 'bg-[#1f1f1f] border-white/[0.09] hover:bg-[#2e2e2e] hover:border-white/[0.15] text-[#4fc3f7]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#6366f1]'}`}
                title="Source Files"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className={`rounded-xl ${isDark ? 'bg-[#1f1f1f] border-white/[0.09] hover:bg-[#2e2e2e] hover:border-[#ef5350]/30 text-[#ef5350]' : 'bg-gray-50 border-gray-200 hover:bg-red-50 hover:border-red-300 text-red-600'}`}
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

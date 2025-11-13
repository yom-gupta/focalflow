'use client'

import { useState, useMemo } from 'react'
import { Button } from '../ui/button'
import { X, Check, CheckCircle, Settings, PlayCircle, Clock, XCircle, Calendar } from 'lucide-react'
import { updateProject } from '@/lib/supabase/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Project } from '@/lib/supabase/types'
import { useTheme } from '@/contexts/ThemeContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { getCompletionTime } from '@/lib/utils/status'

interface ProgressModalProps {
  project: Project
  onClose: () => void
}

const statusIcons = {
  not_started: PlayCircle,
  working: Settings,
  delay: Clock,
  complete: CheckCircle,
  cancel: XCircle
}

const statusColors = {
  not_started: '#64748B',
  working: '#10B981',
  delay: '#F97316',
  complete: '#3B82F6',
  cancel: '#EF4444'
}

const statusLabels = {
  not_started: 'Not Started',
  working: 'Working',
  delay: 'Delay',
  complete: 'Complete',
  cancel: 'Cancel'
}

export default function ProgressModal({ project, onClose }: ProgressModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const queryClient = useQueryClient()

  const getSteps = () => {
    if (project.type === 'video' && project.video_steps) {
      return [
        { key: 'brief', label: 'Client Brief' },
        { key: 'script', label: 'Script / Plan' },
        { key: 'cuts', label: 'Cuts' },
        { key: 'color_grade', label: 'Color Grade' },
        { key: 'motion_graphics', label: 'Motion Graphics' },
        { key: 'sound_design', label: 'Sound Design' },
        { key: 'review', label: 'Client Review' },
        { key: 'revison_2', label: 'Revision 2' },
        { key: 'final_export', label: 'Final Export' },
        { key: 'deliver_files', label: 'Deliver Final Files' },
        { key: 'send_invoice', label: 'Send Invoice' },
        { key: 'get_paid', label: 'Get Paid' }, 
        { key: 'feedback', label: 'Collect Feedback' }
      ]
    } 
    
    else if (project.type === 'thumbnail' && project.thumbnail_steps) {
      return [
        { key: 'brief', label: 'Client Brief' },
        { key: 'concept', label: 'Concept' },
        { key: 'design', label: 'Design' },
        { key: 'review', label: 'Client Review' },
        { key: 'revison_2', label: 'Revision 2' },
        { key: 'finalize', label: 'Finalize Design' }, 
        { key: 'deliver_files', label: 'Deliver Final Files' },
        { key: 'send_invoice', label: 'Send Invoice' },
        { key: 'get_paid', label: 'Get Paid' },
        { key: 'feedback', label: 'Collect Feedback' }
      ]
    }
  
    return []
  }
  
  const steps = getSteps()
  const [stepState, setStepState] = useState(() => {
    if (project.type === 'video' && project.video_steps) {
      return { ...project.video_steps }
    } else if (project.type === 'thumbnail' && project.thumbnail_steps) {
      return { ...project.thumbnail_steps }
    }
    return {}
  })
  const [status, setStatus] = useState(project.status)

  // Calculate timeline data
  const timelineData = useMemo(() => {
    const timeline: Array<{ label: string; date: string; completed: boolean }> = []
    
    if (project.start_date) {
      timeline.push({
        label: 'Project Started',
        date: project.start_date,
        completed: true
      })
    }

    // Add completed steps to timeline
    steps.forEach(step => {
      const isCompleted = stepState[step.key as keyof typeof stepState] || false
      if (isCompleted) {
        // Use updated_at as completion date (approximation)
        timeline.push({
          label: step.label,
          date: project.updated_at || project.created_at,
          completed: true
        })
      }
    })

    if (project.status === 'complete' && project.updated_at) {
      timeline.push({
        label: 'Project Completed',
        date: project.updated_at,
        completed: true
      })
    }

    // Sort by date
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return timeline
  }, [project, steps, stepState])

  const completionTime = getCompletionTime(project)
  const daysInProgress = project.start_date 
    ? Math.floor((new Date().getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateProject(project.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Progress updated successfully!')
      onClose()
    },
    onError: (error: any) => {
      toast.error('Failed to update progress', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const toggleStep = (stepKey: string) => {
    setStepState(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey as keyof typeof prev]
    }))
  }

  const handleSave = () => {
    const updateData: any = {
      status: status
    }
    if (project.type === 'video') {
      updateData.video_steps = stepState
    } else if (project.type === 'thumbnail') {
      updateData.thumbnail_steps = stepState
    }
    updateMutation.mutate(updateData)
  }

  const StatusIcon = statusIcons[status as keyof typeof statusIcons] || PlayCircle
  const statusColor = statusColors[status as keyof typeof statusColors] || '#64748B'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div 
        className={`w-full max-w-6xl rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'} border shadow-xl my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-inherit border-b border-inherit p-6 pb-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
              Update Progress: {project.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={isDark ? 'text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]' : 'text-[#787774] hover:text-[#37352f] hover:bg-gray-100'}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Status Selector */}
          <div className="mb-4">
            <label className={`text-sm font-medium mb-2 block ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
              Project Status
            </label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}>
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-4 h-4" style={{ color: statusColor }} />
                  <span>{statusLabels[status as keyof typeof statusLabels] || status}</span>
                </div>
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'}>
                <SelectItem value="not_started" className={isDark ? 'text-[#ededed] hover:bg-[#373737]' : 'text-[#37352f] hover:bg-gray-100'}>
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" style={{ color: statusColors.not_started }} />
                    <span>Not Started</span>
                  </div>
                </SelectItem>
                <SelectItem value="working" className={isDark ? 'text-[#ededed] hover:bg-[#373737]' : 'text-[#37352f] hover:bg-gray-100'}>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" style={{ color: statusColors.working }} />
                    <span>Working</span>
                  </div>
                </SelectItem>
                <SelectItem value="delay" className={isDark ? 'text-[#ededed] hover:bg-[#373737]' : 'text-[#37352f] hover:bg-gray-100'}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: statusColors.delay }} />
                    <span>Delay</span>
                  </div>
                </SelectItem>
                <SelectItem value="complete" className={isDark ? 'text-[#ededed] hover:bg-[#373737]' : 'text-[#37352f] hover:bg-gray-100'}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: statusColors.complete }} />
                    <span>Complete</span>
                  </div>
                </SelectItem>
                <SelectItem value="cancel" className={isDark ? 'text-[#ededed] hover:bg-[#373737]' : 'text-[#37352f] hover:bg-gray-100'}>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" style={{ color: statusColors.cancel }} />
                    <span>Cancel</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Steps */}
          <div className="flex-1 px-6 pb-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-3 mb-6">
              {steps.map((step) => {
                const isCompleted = stepState[step.key as keyof typeof stepState] || false
                return (
                  <button
                    key={step.key}
                    onClick={() => toggleStep(step.key)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      isCompleted
                        ? isDark 
                          ? 'bg-[#2e2e2e] border-[#4fc3f7]/30 text-[#ededed]' 
                          : 'bg-gray-100 border-[#6366f1]/30 text-[#37352f]'
                        : isDark
                          ? 'bg-[#1f1f1f] border-white/[0.09] text-[#a5a5a5] hover:bg-[#2e2e2e]'
                          : 'bg-white border-gray-200 text-[#787774] hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                      isCompleted
                        ? isDark 
                          ? 'border-[#4fc3f7] bg-[#4fc3f7]' 
                          : 'border-[#6366f1] bg-[#6366f1]'
                        : isDark
                          ? 'border-white/[0.2]'
                          : 'border-gray-300'
                    }`}>
                      {isCompleted && <Check className={`w-4 h-4 ${isDark ? 'text-[#1f1f1f]' : 'text-white'}`} />}
                    </div>
                    <span className="font-medium flex-1 text-left">{step.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Side - Timeline */}
          <div className={`lg:w-80 border-t lg:border-t-0 lg:border-l ${isDark ? 'border-white/[0.09]' : 'border-gray-200'} px-6 pb-6 lg:max-h-[60vh] lg:overflow-y-auto`}>
            <h3 className={`text-sm font-semibold mb-4 mt-6 lg:mt-0 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
              Project Timeline
            </h3>
            
            <div className="space-y-4">
              {/* Project Start */}
              {project.start_date && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#4fc3f7]' : 'bg-[#6366f1]'}`} />
                    <div className={`w-0.5 flex-1 ${isDark ? 'bg-white/[0.1]' : 'bg-gray-200'}`} />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`text-xs font-medium ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                      {new Date(project.start_date).toLocaleDateString()}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                      Project Started
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline Events */}
              {timelineData.length > 0 && (
                <>
                  {timelineData.slice(1, -1).map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'}`} />
                        <div className={`w-0.5 flex-1 ${isDark ? 'bg-white/[0.1]' : 'bg-gray-200'}`} />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className={`text-xs font-medium ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                          {event.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Completion Time */}
              {completionTime !== null && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                      {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'Today'}
                    </p>
                    <p className={`text-sm font-semibold ${isDark ? 'text-[#10B981]' : 'text-[#10B981]'}`}>
                      Completed in {completionTime} {completionTime === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                </div>
              )}

              {/* Current Progress */}
              {!completionTime && daysInProgress !== null && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#4fc3f7]' : 'bg-[#6366f1]'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`}>
                      {daysInProgress} days in progress
                    </p>
                  </div>
                </div>
              )}

              {/* Project Info */}
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/[0.09]' : 'border-gray-200'}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Client</span>
                    <span className={isDark ? 'text-[#ededed]' : 'text-[#37352f]'}>{project.client_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Price</span>
                    <span className={isDark ? 'text-[#ededed]' : 'text-[#37352f]'}>₹{project.price?.toLocaleString()}</span>
                  </div>
                  {project.deadline && (
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Deadline</span>
                      <span className={isDark ? 'text-[#ededed]' : 'text-[#37352f]'}>
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-inherit border-t border-inherit p-6 pt-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className={`flex-1 ${isDark ? 'bg-[#2e2e2e] border-white/[0.09] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#37352f]'} font-normal`}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className={`flex-1 ${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'} font-normal`}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Progress'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

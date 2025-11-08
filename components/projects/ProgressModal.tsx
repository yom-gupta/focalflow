'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { X, Check } from 'lucide-react'
import { updateProject } from '@/lib/supabase/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Project } from '@/lib/supabase/types'
import { useTheme } from '@/contexts/ThemeContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface ProgressModalProps {
  project: Project
  onClose: () => void
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
        { key: 'revison_2' ,label: 'Revison 2' },
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
        { key: 'revison_2' ,label: 'Revison 2' },
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div 
        className={`w-full max-w-md rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'} border shadow-xl my-8`}
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="delay">Delay</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="cancel">Cancel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
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








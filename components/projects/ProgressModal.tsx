'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { X, Check } from 'lucide-react'
import { updateProject } from '@/lib/supabase/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Project } from '@/lib/supabase/types'
import { useTheme } from '@/contexts/ThemeContext'

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
        { key: 'cuts', label: 'Cuts' },
        { key: 'color_grade', label: 'Color Grade' },
        { key: 'sound_design', label: 'Sound Design' },
        { key: 'motion_graphics', label: 'Motion Graphics' },
        { key: 'export', label: 'Export' }
      ]
    } else if (project.type === 'thumbnail' && project.thumbnail_steps) {
      return [
        { key: 'concept', label: 'Concept' },
        { key: 'design', label: 'Design' },
        { key: 'review', label: 'Review' },
        { key: 'final', label: 'Final' }
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
    const updateData: any = {}
    if (project.type === 'video') {
      updateData.video_steps = stepState
    } else if (project.type === 'thumbnail') {
      updateData.thumbnail_steps = stepState
    }
    updateMutation.mutate(updateData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className={`w-full max-w-md rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
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
  )
}




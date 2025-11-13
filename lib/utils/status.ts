import type { Project } from '@/lib/supabase/types'

// Step lists for different project types
const VIDEO_STEPS = [
  'brief',
  'script',
  'cuts',
  'color_grade',
  'motion_graphics',
  'sound_design',
  'review',
  'revison_2',
  'final_export',
  'deliver_files',
  'send_invoice',
  'get_paid',
  'feedback'
]

const THUMBNAIL_STEPS = [
  'brief',
  'concept',
  'design',
  'review',
  'revison_2',
  'finalize',
  'deliver_files',
  'send_invoice',
  'get_paid',
  'feedback'
]

// Human-readable stage labels
const STAGE_LABEL_MAP: Record<string, string> = {
  'brief': 'Client Brief',
  'script': 'Script / Plan',
  'cuts': 'Cuts',
  'color_grade': 'Color Grade',
  'motion_graphics': 'Motion Graphics',
  'sound_design': 'Sound Design',
  'review': 'Client Review',
  'revison_2': 'Revision 2',
  'final_export': 'Final Export',
  'deliver_files': 'Deliver Final Files',
  'send_invoice': 'Send Invoice',
  'get_paid': 'Get Paid',
  'feedback': 'Collect Feedback',
  'concept': 'Concept',
  'design': 'Design',
  'finalize': 'Finalize Design'
}

/**
 * Returns the current stage label for a project based on completed steps
 */
export function getStageLabel(project: Project): string {
  if (project.type === 'video' && project.video_steps) {
    const steps = VIDEO_STEPS
    const stepState = project.video_steps as Record<string, boolean>
    
    // Find the last completed step
    let lastCompletedIndex = -1
    for (let i = 0; i < steps.length; i++) {
      if (stepState[steps[i]]) {
        lastCompletedIndex = i
      }
    }
    
    // Return the next step after the last completed one, or the first if none completed
    if (lastCompletedIndex < steps.length - 1) {
      const nextStep = steps[lastCompletedIndex + 1]
      return STAGE_LABEL_MAP[nextStep] || nextStep
    }
    
    // All steps completed
    return 'Complete'
  }
  
  if (project.type === 'thumbnail' && project.thumbnail_steps) {
    const steps = THUMBNAIL_STEPS
    const stepState = project.thumbnail_steps as Record<string, boolean>
    
    // Find the last completed step
    let lastCompletedIndex = -1
    for (let i = 0; i < steps.length; i++) {
      if (stepState[steps[i]]) {
        lastCompletedIndex = i
      }
    }
    
    // Return the next step after the last completed one, or the first if none completed
    if (lastCompletedIndex < steps.length - 1) {
      const nextStep = steps[lastCompletedIndex + 1]
      return STAGE_LABEL_MAP[nextStep] || nextStep
    }
    
    // All steps completed
    return 'Complete'
  }
  
  return 'Not started'
}

/**
 * Returns status metadata (icon, color, label) for a project
 */
export function projectStatusMeta(project: Project) {
  // Normalize states
  const isComplete = project.status === 'complete'
  const isWorking = project.status === 'working' || (project.status !== 'complete' && project.status !== 'not_started' && project.status !== 'cancel')
  const isNotStarted = project.status === 'not_started'
  const isDelayed = project.status === 'delay'
  const isCancelled = project.status === 'cancel'

  // Get current stage
  const currentStage = getStageLabel(project)

  if (isComplete) {
    return {
      icon: 'check-circle',
      color: '#3B82F6', // blue
      label: 'Complete',
      subLabel: currentStage
    }
  }

  if (isCancelled) {
    return {
      icon: 'x-circle',
      color: '#EF4444', // red
      label: 'Cancelled',
      subLabel: currentStage
    }
  }

  if (isDelayed) {
    return {
      icon: 'clock',
      color: '#F97316', // orange
      label: 'Delayed',
      subLabel: currentStage
    }
  }

  if (isNotStarted) {
    return {
      icon: 'play-circle',
      color: '#64748B', // grey
      label: 'Not started',
      subLabel: currentStage
    }
  }

  if (isWorking) {
    return {
      icon: 'settings',
      color: '#10B981', // green
      label: 'In progress',
      subLabel: currentStage
    }
  }

  return {
    icon: 'circle',
    color: '#94A3B8',
    label: 'Unknown',
    subLabel: currentStage
  }
}

/**
 * Returns invoice metadata (icon, color, title) for a project
 * Uses step completion to determine invoice status
 * Only shows payment icon when client has paid (get_paid step is complete)
 */
export function invoiceMeta(project: Project) {
  let paid = false

  // Check if payment step is completed
  if (project.type === 'video' && project.video_steps) {
    const steps = project.video_steps as Record<string, boolean>
    paid = steps.get_paid === true
  } else if (project.type === 'thumbnail' && project.thumbnail_steps) {
    const steps = project.thumbnail_steps as Record<string, boolean>
    paid = steps.get_paid === true
  }

  // Only return payment info if paid
  if (paid) {
    return { 
      icon: 'currency-inr', 
      color: '#10B981', // green
      title: 'Paid',
      show: true
    }
  }

  // Don't show payment icon if not paid
  return { 
    icon: 'currency-inr', 
    color: '#6B7280', // dark grey
    title: 'Not paid',
    show: false
  }
}

/**
 * Calculates remaining money to collect
 */
export function getRemainingMoney(project: Project): number {
  let paid = false

  // Check if payment step is completed
  if (project.type === 'video' && project.video_steps) {
    const steps = project.video_steps as Record<string, boolean>
    paid = steps.get_paid === true
  } else if (project.type === 'thumbnail' && project.thumbnail_steps) {
    const steps = project.thumbnail_steps as Record<string, boolean>
    paid = steps.get_paid === true
  }

  if (paid) {
    return 0 // All money collected
  }

  return project.price || 0 // Full amount remaining
}

/**
 * Calculates project completion time in days
 */
export function getCompletionTime(project: Project): number | null {
  if (project.status !== 'complete' || !project.start_date) {
    return null
  }

  const start = new Date(project.start_date)
  const end = project.updated_at ? new Date(project.updated_at) : new Date()
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}


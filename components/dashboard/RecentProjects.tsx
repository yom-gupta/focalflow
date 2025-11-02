'use client'

import Link from 'next/link'
import { Badge } from '../ui/badge'
import { ArrowRight } from 'lucide-react'
import type { Project } from '@/lib/supabase/types'
import { useTheme } from '@/contexts/ThemeContext'

interface RecentProjectsProps {
  projects: Project[]
}

const statusColors: Record<string, string> = {
  working: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delay: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  complete: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancel: 'bg-red-500/20 text-red-400 border-red-500/30'
}

export default function RecentProjects({ projects }: RecentProjectsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>Recent Projects</h2>
        <Link 
          href="/projects"
          className={`group flex items-center gap-2 text-sm font-normal ${isDark ? 'text-[#4fc3f7] hover:text-[#81c9e3]' : 'text-[#6366f1] hover:text-[#818cf8]'} transition-colors`}
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="space-y-3">
        {projects.slice(0, 5).map((project) => (
          <div
            key={project.id}
            className={`group p-4 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09] hover:bg-[#2e2e2e]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} border transition-all duration-200`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-semibold truncate ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>{project.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {project.type}
                  </Badge>
                </div>
                <div className={`flex items-center gap-4 text-sm font-normal ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                  <span>{project.client_name}</span>
                  <span>•</span>
                  <span className={`font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>₹{project.price?.toLocaleString()}</span>
                </div>
              </div>
              <Badge className={`${statusColors[project.status] || ''} border font-medium`}>
                {project.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


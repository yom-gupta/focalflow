'use client'

import Link from 'next/link'
import { Pin, PinOff } from 'lucide-react'
import { Button } from '../ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import type { InspirationFolder } from '@/lib/supabase/types'
import { updateInspirationFolder } from '@/lib/supabase/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface FolderCardProps {
  folder: InspirationFolder
}

export default function FolderCard({ folder }: FolderCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const queryClient = useQueryClient()

  const pinMutation = useMutation({
    mutationFn: (pinned: boolean) => updateInspirationFolder(folder.id, { pinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-folders'] })
    },
    onError: () => {
      toast.error('Failed to update folder')
    },
  })

  const handlePinToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    pinMutation.mutate(!folder.pinned)
  }

  return (
    <Link href={`/inspiration/${folder.id}`}>
      <div className={`group relative rounded-xl overflow-hidden border transition-all duration-200 hover:scale-[1.02] ${
        isDark ? 'bg-[#2e2e2e] border-white/[0.09] hover:border-[#8B5CF6]' : 'bg-white border-gray-200 hover:border-[#8B5CF6]'
      }`}>
        <div className="h-40 w-full relative">
          {folder.thumbnail_url ? (
            <img 
              src={folder.thumbnail_url} 
              alt={folder.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`h-full w-full flex items-center justify-center ${
              isDark ? 'bg-[#1f1f1f]' : 'bg-gray-100'
            }`}>
              <span className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-gray-500'}`}>
                No thumbnail
              </span>
            </div>
          )}
          <button
            onClick={handlePinToggle}
            className={`absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm transition-all ${
              folder.pinned
                ? 'bg-[#8B5CF6]/80 text-white'
                : isDark
                  ? 'bg-black/40 text-[#a5a5a5] hover:bg-black/60'
                  : 'bg-white/60 text-gray-600 hover:bg-white/80'
            }`}
          >
            {folder.pinned ? (
              <Pin className="w-4 h-4" />
            ) : (
              <PinOff className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="p-4">
          <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
            {folder.name}
          </h3>
          <p className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
            {folder.item_count} items • {new Date(folder.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  )
}


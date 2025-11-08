'use client'

import { ExternalLink, FileText, Image as ImageIcon, Link as LinkIcon, Camera } from 'lucide-react'
import { Button } from '../ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import type { InspirationItem } from '@/lib/supabase/types'
import { deleteInspirationItem, updateFolderThumbnailFromItems } from '@/lib/supabase/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface ItemCardProps {
  item: InspirationItem
}

export default function ItemCard({ item }: ItemCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await deleteInspirationItem(item.id)
      // Update folder thumbnail if needed (in case we deleted the thumbnail item)
      await updateFolderThumbnailFromItems(item.folder_id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-items', item.folder_id] })
      queryClient.invalidateQueries({ queryKey: ['inspiration-folders'] })
      toast.success('Item deleted')
    },
    onError: () => {
      toast.error('Failed to delete item')
    },
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this item?')) {
      deleteMutation.mutate()
    }
  }

  const getIcon = () => {
    switch (item.type) {
      case 'image':
      case 'screenshot':
        return <ImageIcon className="w-4 h-4" />
      case 'link':
        return <LinkIcon className="w-4 h-4" />
      case 'text':
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  if (item.type === 'image' || item.type === 'screenshot') {
    return (
      <div className={`group relative rounded-lg overflow-hidden border transition-all hover:scale-[1.02] ${
        isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'
      }`}>
        {item.image_url ? (
          <div className="relative">
            <img 
              src={item.image_url} 
              alt={item.title || 'Inspiration image'}
              className="w-full h-auto object-cover"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className={`h-8 w-8 ${isDark ? 'bg-black/60 hover:bg-black/80 text-red-400' : 'bg-white/80 hover:bg-white text-red-600'}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className={`h-32 flex items-center justify-center ${isDark ? 'bg-[#1f1f1f]' : 'bg-gray-100'}`}>
            {getIcon()}
          </div>
        )}
        {(item.title || item.note) && (
          <div className="p-3">
            {item.title && (
              <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                {item.title}
              </h4>
            )}
            {item.note && (
              <p className={`text-xs line-clamp-2 ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                {item.note}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  if (item.type === 'link') {
    return (
      <div className={`rounded-lg border p-4 transition-all hover:scale-[1.02] ${
        isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getIcon()}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm ${isDark ? 'text-[#4fc3f7] hover:text-[#81c9e3]' : 'text-[#6366f1] hover:text-[#818cf8]'}`}
              >
                {item.title || 'Link'}
              </a>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className={`h-6 w-6 ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        {item.image_url && (
          <img 
            src={item.image_url} 
            alt={item.title || 'Link preview'}
            className="w-full h-32 object-cover rounded mb-2"
          />
        )}
        {item.note && (
          <p className={`text-xs ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
            {item.note}
          </p>
        )}
      </div>
    )
  }

  if (item.type === 'text') {
    return (
      <div className={`rounded-lg border p-4 transition-all hover:scale-[1.02] ${
        isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getIcon()}
            {item.title && (
              <h4 className={`text-sm font-medium ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                {item.title}
              </h4>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className={`h-6 w-6 ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        {item.note && (
          <p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
            {item.note}
          </p>
        )}
      </div>
    )
  }

  return null
}


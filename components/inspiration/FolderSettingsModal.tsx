'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { X, Trash2 } from 'lucide-react'
import { updateInspirationFolder, deleteInspirationFolder } from '@/lib/supabase/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import type { InspirationFolder } from '@/lib/supabase/types'

interface FolderSettingsModalProps {
  folder: InspirationFolder
  onClose: () => void
}

export default function FolderSettingsModal({ folder, onClose }: FolderSettingsModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const router = useRouter()
  const [name, setName] = useState(folder.name)
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (data: Partial<InspirationFolder>) => updateInspirationFolder(folder.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-folders'] })
      queryClient.invalidateQueries({ queryKey: ['inspiration-folder', folder.id] })
      toast.success('Folder updated successfully!')
      onClose()
    },
    onError: (error: any) => {
      toast.error('Failed to update folder', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteInspirationFolder(folder.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-folders'] })
      toast.success('Folder deleted successfully!')
      router.push('/inspiration')
      onClose()
    },
    onError: (error: any) => {
      toast.error('Failed to delete folder', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter a folder name')
      return
    }
    updateMutation.mutate({ name: name.trim() })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this folder? All items inside will be deleted.')) {
      deleteMutation.mutate()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-md rounded-xl border p-6 ${
          isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
            Folder Settings
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Folder Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed] mt-2' : 'bg-gray-50 border-gray-200 text-[#37352f] mt-2'}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              className={`flex-1 ${isDark ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400' : 'bg-red-50 border-red-200 hover:bg-red-100 text-red-600'} font-normal`}
              disabled={deleteMutation.isPending || updateMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`flex-1 ${isDark ? 'bg-[#2e2e2e] border-white/[0.09] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#37352f]'} font-normal`}
              disabled={deleteMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'} font-normal`}
              disabled={deleteMutation.isPending || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


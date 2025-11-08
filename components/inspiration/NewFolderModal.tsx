'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { X } from 'lucide-react'
import { createInspirationFolder } from '@/lib/supabase/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTheme } from '@/contexts/ThemeContext'

interface NewFolderModalProps {
  onClose: () => void
}

export default function NewFolderModal({ onClose }: NewFolderModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [name, setName] = useState('')
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createInspirationFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-folders'] })
      toast.success('Folder created successfully!')
      onClose()
    },
    onError: (error: any) => {
      toast.error('Failed to create folder', {
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
    createMutation.mutate({ name: name.trim(), pinned: false })
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
            New Folder
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
              placeholder="e.g., Thumbnail Ideas"
              className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed] mt-2' : 'bg-gray-50 border-gray-200 text-[#37352f] mt-2'}
              autoFocus
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`flex-1 ${isDark ? 'bg-[#2e2e2e] border-white/[0.09] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#37352f]'} font-normal`}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'} font-normal`}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


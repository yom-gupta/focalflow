'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { X, Image as ImageIcon, Link as LinkIcon, FileText, Camera } from 'lucide-react'
import { createInspirationItem, getInspirationItems, updateFolderThumbnailFromItems, getInspirationFolders } from '@/lib/supabase/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTheme } from '@/contexts/ThemeContext'
import { supabase } from '@/lib/supabase/client'
import type { Project } from '@/lib/supabase/types'

interface AddItemModalProps {
  folderId: string
  projects: Project[]
  onClose: () => void
}

export default function AddItemModal({ folderId, projects, onClose }: AddItemModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [type, setType] = useState<'image' | 'link' | 'text' | 'screenshot'>('image')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Handle paste events for screenshots
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (type !== 'screenshot' && type !== 'image') return
      
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault()
          const blob = items[i].getAsFile()
          if (blob) {
            setFile(blob)
            setType('screenshot')
            const reader = new FileReader()
            reader.onload = (e) => {
              setImageUrl(e.target?.result as string)
            }
            reader.readAsDataURL(blob)
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [type])

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folderId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('inspiration')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('inspiration')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const fetchLinkPreview = async (url: string) => {
    try {
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Failed to fetch link preview:', error)
    }
    return null
  }

  const createMutation = useMutation({
    mutationFn: async (itemData: any) => {
      // Check for duplicate URLs
      if (type === 'link' && url) {
        const existingItems = await getInspirationItems(folderId)
        const duplicate = existingItems.find(i => i.type === 'link' && i.url === url)
        if (duplicate) {
          throw new Error('This link already exists in this folder')
        }
      }

      let finalImageUrl = imageUrl
      if (file && (type === 'image' || type === 'screenshot')) {
        setIsUploading(true)
        try {
          finalImageUrl = await uploadFile(file)
        } catch (error: any) {
          throw new Error(`Upload failed: ${error.message}`)
        } finally {
          setIsUploading(false)
        }
      }

      // Fetch link preview if it's a link
      if (type === 'link' && url) {
        const preview = await fetchLinkPreview(url)
        if (preview) {
          finalImageUrl = preview.image || finalImageUrl
          if (!title && preview.title) {
            setTitle(preview.title)
          }
        }
      }

      const newItem = await createInspirationItem({
        folder_id: folderId,
        type,
        title: title.trim() || undefined,
        url: type === 'link' ? url.trim() : undefined,
        image_url: finalImageUrl || undefined,
        note: note.trim() || undefined,
        tags: [],
      })

      // Update folder thumbnail if this item has an image
      if (finalImageUrl && (type === 'image' || type === 'screenshot' || type === 'link')) {
        // Get current folder to check if it has a thumbnail
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const folders = await getInspirationFolders(user.id)
          const folder = folders.find((f) => f.id === folderId)
          
          // Only update if folder doesn't have a thumbnail yet
          if (!folder?.thumbnail_url) {
            await updateFolderThumbnailFromItems(folderId)
          }
        }
      }

      return newItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-items', folderId] })
      queryClient.invalidateQueries({ queryKey: ['inspiration-folders'] })
      toast.success('Item added successfully!')
      onClose()
    },
    onError: (error: any) => {
      toast.error('Failed to add item', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (type === 'link' && !url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    if ((type === 'image' || type === 'screenshot') && !file && !imageUrl) {
      toast.error('Please select an image')
      return
    }

    if (type === 'text' && !note.trim() && !title.trim()) {
      toast.error('Please enter some text')
      return
    }

    createMutation.mutate({})
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-2xl rounded-xl border p-6 my-8 ${
          isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
            Add Inspiration Item
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
          {/* Type Selector */}
          <div>
            <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774] mb-3 block'}>Item Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'image', label: 'Image', icon: ImageIcon },
                { value: 'screenshot', label: 'Screenshot', icon: Camera },
                { value: 'link', label: 'Link', icon: LinkIcon },
                { value: 'text', label: 'Note', icon: FileText },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value as any)}
                  className={`p-3 rounded-lg border transition-all ${
                    type === value
                      ? isDark
                        ? 'bg-[#2e2e2e] border-[#8B5CF6] text-[#8B5CF6]'
                        : 'bg-gray-100 border-[#8B5CF6] text-[#8B5CF6]'
                      : isDark
                        ? 'bg-[#1f1f1f] border-white/[0.09] text-[#a5a5a5] hover:bg-[#2e2e2e]'
                        : 'bg-white border-gray-200 text-[#787774] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Title (optional)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed] mt-2' : 'bg-gray-50 border-gray-200 text-[#37352f] mt-2'}
            />
          </div>

          {/* Type-specific inputs */}
          {(type === 'image' || type === 'screenshot') && (
            <div>
              <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>
                {type === 'screenshot' ? 'Screenshot (paste or upload)' : 'Image'}
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="mt-2 space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full ${isDark ? 'bg-[#2e2e2e] border-white/[0.09] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#37352f]'}`}
                >
                  {file ? 'Change Image' : 'Upload Image'}
                </Button>
                {imageUrl && (
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFile(null)
                        setImageUrl('')
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {type === 'link' && (
            <div>
              <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed] mt-2' : 'bg-gray-50 border-gray-200 text-[#37352f] mt-2'}
                required
              />
            </div>
          )}

          {/* Note */}
          <div>
            <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>
              {type === 'text' ? 'Note' : 'Note (optional)'}
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={type === 'text' ? 'Enter your note...' : 'Add a note...'}
              rows={type === 'text' ? 6 : 3}
              className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed] mt-2' : 'bg-gray-50 border-gray-200 text-[#37352f] mt-2'}
              required={type === 'text'}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`flex-1 ${isDark ? 'bg-[#2e2e2e] border-white/[0.09] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#37352f]'} font-normal`}
              disabled={createMutation.isPending || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'} font-normal`}
              disabled={createMutation.isPending || isUploading}
            >
              {isUploading ? 'Uploading...' : createMutation.isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


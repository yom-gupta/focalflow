'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft, Settings, Pin, Link as LinkIcon } from 'lucide-react'
import Layout from '@/components/layout'
import ItemCard from '@/components/inspiration/ItemCard'
import AddItemModal from '@/components/inspiration/AddItemModal'
import FolderSettingsModal from '@/components/inspiration/FolderSettingsModal'
import { getInspirationFolders, getInspirationItems, updateInspirationFolder } from '@/lib/supabase/queries'
import { getUser } from '@/lib/auth'
import { useTheme } from '@/contexts/ThemeContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getProjects } from '@/lib/supabase/queries'

export default function FolderView() {
  const router = useRouter()
  const params = useParams()
  const folderId = params.id as string
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [userId, setUserId] = useState<string | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    getUser().then((user) => {
      if (!user) {
        router.push('/')
      } else {
        setUserId(user.id)
      }
    })
  }, [router])

  const { data: folders = [] } = useQuery({
    queryKey: ['inspiration-folders', userId],
    queryFn: () => userId ? getInspirationFolders(userId) : [],
    enabled: !!userId,
  })

  const folder = folders.find(f => f.id === folderId)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inspiration-items', folderId],
    queryFn: () => getInspirationItems(folderId),
    enabled: !!folderId,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => userId ? getProjects(userId) : [],
    enabled: !!userId && showAddItem,
  })

  const pinMutation = useMutation({
    mutationFn: (pinned: boolean) => updateInspirationFolder(folderId, { pinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-folders'] })
      toast.success(folder?.pinned ? 'Folder unpinned' : 'Folder pinned')
    },
  })

  if (!userId) {
    return (
      <Layout>
        <div className="min-h-screen p-8 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  if (!folder) {
    return (
      <Layout>
        <div className="min-h-screen p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <p className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Folder not found</p>
          </div>
        </div>
      </Layout>
    )
  }

  const imageItems = items.filter(i => i.type === 'image' || i.type === 'screenshot')
  const otherItems = items.filter(i => i.type !== 'image' && i.type !== 'screenshot')

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/inspiration')}
              className={isDark ? 'text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]' : 'text-[#787774] hover:text-[#37352f] hover:bg-gray-100'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className={`text-3xl font-semibold flex-1 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
              {folder.name}
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => pinMutation.mutate(!folder.pinned)}
                className={isDark ? 'border-white/[0.09] hover:bg-[#2e2e2e] text-[#ededed]' : 'border-gray-200 hover:bg-gray-50 text-[#37352f]'}
              >
                <Pin className={`w-4 h-4 mr-2 ${folder.pinned ? 'fill-current' : ''}`} />
                {folder.pinned ? 'Pinned' : 'Pin'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className={isDark ? 'border-white/[0.09] hover:bg-[#2e2e2e] text-[#ededed]' : 'border-gray-200 hover:bg-gray-50 text-[#37352f]'}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={() => setShowAddItem(true)}
                className={`${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-900 hover:bg-gray-800 text-white'} border border-border font-normal`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className={`rounded-lg border p-4 ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
              {items.length} items • Last updated {new Date(folder.updated_at).toLocaleDateString()}
            </p>
          </div>

          {/* Masonry Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : items.length === 0 ? (
            <div className={`text-center py-12 rounded-lg border ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-gray-50 border-gray-200'}`}>
              <p className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774] mb-4'}>
                No items yet. Add your first inspiration item!
              </p>
              <Button
                onClick={() => setShowAddItem(true)}
                className={`${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-900 hover:bg-gray-800 text-white'} border border-border font-normal`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {imageItems.map((item) => (
                <div key={item.id} className="break-inside-avoid mb-4">
                  <ItemCard item={item} />
                </div>
              ))}
              {otherItems.map((item) => (
                <div key={item.id} className="break-inside-avoid mb-4">
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddItem && (
          <AddItemModal 
            folderId={folderId}
            projects={projects}
            onClose={() => setShowAddItem(false)} 
          />
        )}
        {showSettings && (
          <FolderSettingsModal 
            folder={folder}
            onClose={() => setShowSettings(false)} 
          />
        )}
      </div>
    </Layout>
  )
}


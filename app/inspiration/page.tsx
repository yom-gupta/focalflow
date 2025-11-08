'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import Layout from '@/components/layout'
import FolderCard from '@/components/inspiration/FolderCard'
import NewFolderModal from '@/components/inspiration/NewFolderModal'
import { getInspirationFolders } from '@/lib/supabase/queries'
import { getUser } from '@/lib/auth'
import { useTheme } from '@/contexts/ThemeContext'

export default function InspirationPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)

  useEffect(() => {
    getUser().then((user) => {
      if (!user) {
        router.push('/')
      } else {
        setUserId(user.id)
      }
    })
  }, [router])

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ['inspiration-folders', userId],
    queryFn: () => userId ? getInspirationFolders(userId) : [],
    enabled: !!userId,
  })

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedFolders = filteredFolders.filter(f => f.pinned)
  const unpinnedFolders = filteredFolders.filter(f => !f.pinned)

  if (!userId) {
    return (
      <Layout>
        <div className="min-h-screen p-8 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className={`text-3xl font-semibold mb-1 tracking-tight ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                Inspiration Library
              </h1>
              <p className={`${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} font-normal text-sm`}>
                Organize your creative references and ideas
              </p>
            </div>
            <Button
              onClick={() => setShowNewFolder(true)}
              className={`${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-900 hover:bg-gray-800 text-white'} border border-border font-normal`}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#6e6e6e]' : 'text-gray-400'}`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inspiration folders..."
              className={`pl-10 ${isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed] placeholder:text-[#6e6e6e]' : 'bg-gray-50 border-gray-200 text-[#37352f] placeholder:text-gray-400'}`}
            />
          </div>

          {/* Pinned Folders */}
          {pinnedFolders.length > 0 && (
            <div>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                Pinned
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pinnedFolders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            </div>
          )}

          {/* All Folders */}
          <div>
            {pinnedFolders.length > 0 && (
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                All Folders
              </h2>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : unpinnedFolders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {unpinnedFolders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 rounded-lg border ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-gray-50 border-gray-200'}`}>
                <p className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>
                  {searchQuery ? 'No folders found' : 'No folders yet. Create your first folder to get started!'}
                </p>
              </div>
            )}
          </div>
        </div>

        {showNewFolder && <NewFolderModal onClose={() => setShowNewFolder(false)} />}
      </div>
    </Layout>
  )
}

